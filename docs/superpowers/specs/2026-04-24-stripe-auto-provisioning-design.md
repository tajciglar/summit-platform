# Stripe Product/Price Auto-Provisioning

**Date:** 2026-04-24
**Status:** Approved, ready for implementation plan
**Related:** Extends existing phase-based pricing (`price_pre_summit_cents`, `stripe_price_pre_id`, etc.) already on `products`.

## Background

The platform already has a complete phase-based pricing model:

- **Phases:** `pre`, `late_pre`, `during`, `post` — cutovers driven by timestamps on `summits` (`pre_summit_starts_at`, `late_pre_summit_starts_at`, `during_summit_starts_at`, `post_summit_starts_at`).
- **Phase resolver:** `Summit::computePhase()` + `summits.current_phase` column, maintained by the `summits:update-phases` artisan command.
- **Price storage:** each phase has its own `price_*_cents` column *and* its own `stripe_price_*_id` column on `products`.
- **Helpers:** `Product::priceCentsForPhase($phase)` and `Product::stripePriceIdForPhase($phase)`.
- **Order audit:** `orders.summit_phase_at_purchase`.

The gap today: **operators paste Stripe Price IDs by hand.** `ProductResource` exposes four bare `TextInput`s (`stripe_price_pre_id`, `stripe_price_late_id`, `stripe_price_during_id`, `stripe_price_post_id`) where the operator copies IDs from the Stripe dashboard. This is error-prone and blocks a fully Filament-driven workflow.

Checkout does not exist yet. This spec covers only the auto-provisioning foundation, not checkout itself.

## Goals

1. Remove manual Stripe Price ID entry from the operator workflow.
2. Keep Stripe IDs and phase prices in sync automatically, including when prices change.
3. Lay a foundation that checkout (built later) can simply consume: "give me the Stripe Price ID for this product at this phase."
4. Preserve historical purchase analytics — "how many people bought product X at $Y" must be answerable even after the price is changed.

## Non-goals

- Checkout flow, Payment Intents, Checkout Sessions.
- Order / order-line-item schema. (Separate spec when checkout is designed.)
- Refunds, subscriptions lifecycle, webhook handling.
- Multi-currency. Single currency (USD) for now.
- Combo products. Combos render as child line items at checkout; the combo itself has no Stripe Price. Skip entirely.
- Display-only `compare_*_cents` fields. Strikethrough UI only; no Stripe sync.

## Design

### Trigger

A Product is synced to Stripe when it is saved *and* `is_active = true`.

- `is_active = false` → never touch Stripe. Lets operators draft freely.
- First flip to `is_active = true` → initial provisioning job.
- Later edits while `is_active = true` → reconciliation job (see "Price changes").
- Flip back to `is_active = false` → no action. Existing Stripe objects stay as-is. (Archive-on-deactivate is deferred; we can add later if the Stripe dashboard gets noisy.)

### Execution model

Async, via queued job `App\Jobs\SyncProductToStripe`.

**Why async, not sync:**
- Stripe API latency (4-5 calls × 200-500ms) would make Filament saves feel slow.
- Survives transient Stripe outages without blocking operator work.
- Enables retry without surfacing low-level Stripe errors in the save UX.

**New columns on `products`:**

| Column | Type | Purpose |
|---|---|---|
| `stripe_sync_status` | enum: `pending`, `synced`, `failed` | Current sync state. Default `pending`. |
| `stripe_sync_error` | text, nullable | Last error message when `status = failed`. |
| `stripe_synced_at` | timestamptz, nullable | When the last successful sync completed. |

### Job responsibilities

`SyncProductToStripe` handles one product per run:

1. **Ensure Stripe Product exists.**
   - If `stripe_product_id` is null → `stripe.products.create({name, metadata: {internal_id: $product->id}})` with idempotency key `product-create-{product_id}`.
   - If it exists → optionally `stripe.products.update` if `name`/`description` drifted. (Metadata-only update; no breaking changes.)

2. **Ensure Stripe Price exists for each phase.**
   For each phase in `['pre', 'late_pre', 'during', 'post']`:
   - Let `$cents = $product->priceCentsForPhase($phase)`.
   - Let `$stripePriceId = $product->stripePriceIdForPhase($phase)`.
   - If `$cents` is null → skip (phase not priced).
   - If `$stripePriceId` is null → create a new Stripe Price with idempotency key `price-create-{product_id}-{phase}-{cents}`. Store the returned ID.
   - If `$stripePriceId` is set and the amount on Stripe's side matches `$cents` → no-op.
   - If `$stripePriceId` is set and the amount differs → **archive + recreate** (see below).

3. **Recurring vs one-time.**
   - If `billing_interval` is set (e.g., `'month'`) → create a recurring Stripe Price (`{recurring: {interval: 'month'}}`).
   - If `intro_price_cents` + `intro_period_months` are set → create with Stripe's `recurring.trial_period_days` or a separate intro Price (finalize during implementation; note in plan).
   - Otherwise → one-time Price.

4. **Mark success / failure.**
   - On success: `stripe_sync_status = 'synced'`, `stripe_synced_at = now()`, clear `stripe_sync_error`.
   - On exception: `stripe_sync_status = 'failed'`, `stripe_sync_error = $e->getMessage()`. Job `->fail()`s so Laravel's queue retry/backoff applies.

### Price changes (forward-only)

Stripe Prices are immutable. When an operator edits `price_pre_summit_cents` on a synced product:

1. Call `stripe.prices.update(old_id, {active: false})` to archive.
2. Create a new Price with the new amount. Use idempotency key `price-create-{product_id}-{phase}-{new_cents}`.
3. Update `stripe_price_*_id` on the Product.

**Rule: forward-only.** Old Stripe Price stays archived but queryable. Past orders reference it via their own snapshot (see "Historical integrity" below). No retroactive rewrites.

### Historical integrity guarantee

This is the core analytics requirement: **one logical product, many prices over time, answerable via `COUNT(*) GROUP BY product_id, unit_price_cents`.** Replaces the Woo workaround of duplicating a product per price.

Constraint for whoever builds checkout later: each order line item MUST snapshot these fields at purchase time:

- `product_id`
- `unit_price_cents` — literal cents charged
- `stripe_price_id` — the exact Stripe Price ID used for this checkout
- `summit_phase_at_purchase` — already on `orders`

With those snapshots, archiving a Stripe Price has zero effect on past orders. Analytics, refunds, revenue reports all read from the order snapshot, never from `$order->product->current_price`.

**This rule must be enforced in the checkout spec.** Noted here so it isn't forgotten.

### Filament integration

`ProductResource` changes:

- **Remove** the four manual `TextInput`s for `stripe_price_*_id`. They become read-only, system-managed.
- **Add** a read-only section showing current Stripe IDs + `stripe_sync_status` badge + `stripe_synced_at` timestamp.
- **Add** a "Retry sync" action (visible when `status = failed`) that re-dispatches `SyncProductToStripe`.
- **Save lifecycle hook:** after save, if `is_active = true`, dispatch the job.
- **Combo products** (`kind = 'combo'`) → skip entirely, show an info panel instead: "Combos use child products' Stripe Prices at checkout. No direct Stripe provisioning."

### Testing

- Unit test `SyncProductToStripe` with a mocked `StripeClient`:
  - Creates Product when missing.
  - Creates Prices for each priced phase.
  - Skips unpriced phases.
  - Archives + recreates on amount change.
  - Idempotency keys present and deterministic.
  - Marks `stripe_sync_status` correctly on success and failure.
- Feature test `ProductResource`:
  - Saving with `is_active = true` dispatches the job.
  - Saving with `is_active = false` does not dispatch.
  - Combo products do not dispatch.
- No live Stripe calls in tests. Fake the `StripeClient` singleton via the container.

## Schema changes

Single migration:

```php
Schema::table('products', function (Blueprint $table) {
    $table->string('stripe_sync_status')->default('pending')->after('stripe_product_id');
    $table->text('stripe_sync_error')->nullable()->after('stripe_sync_status');
    $table->timestampTz('stripe_synced_at')->nullable()->after('stripe_sync_error');
});
```

No changes to phase or price columns; those already exist and are correctly shaped.

## Open questions (resolve during implementation plan)

1. Exact Stripe shape for `intro_price_cents` + `intro_period_months` — use `trial_period_days` or a separate "intro" Price? Requires looking at Stripe Billing docs.
2. Should deactivating a Product (`is_active = false`) archive its Stripe Prices? Deferred; add later if needed.
3. Should Stripe Product metadata include `summit_id`? No — products are now global (see `2026_04_23_072056_globalize_products_with_summit_pivot.php`). Metadata should reference `product_id` only.

## Deferred (not this spec)

- Checkout flow and Order/order-line-item schema (separate spec, must honor "Historical integrity guarantee" above).
- Edit-warning modal in Filament ("this will archive the current Stripe Price"). Add if it becomes a footgun.
- Archive-on-deactivate.
- Stripe webhook listener beyond what Cashier already provides.
- Multi-currency.
