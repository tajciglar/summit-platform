# Domain Dashboard Analytics — Design Spec

**Date:** 2026-04-22
**Scope:** Phase 1 — funnel drop-off only. Revenue analytics deferred until native Stripe checkout replaces the WP redirect.

---

## Goal

Answer two questions on `/admin/{domain}` for each summit:

1. **Is this funnel leaking?** — where between optin-view and checkout-click do visitors drop off?
2. **Which step is underperforming vs. benchmark?** — surfaced only when a step is below threshold.

Revenue ("is this summit making money?") is an explicit Phase 2 concern and is **out of scope** here. Checkout completes on WordPress today; pulling those numbers into Laravel would be throwaway integration work.

---

## Funnel shape

Four events tracked per visitor per summit:

1. `optin` — optin page view
2. `optin_submit` — optin form submission succeeded
3. `sales` — sales page view
4. `checkout_click` — sales-page CTA clicked, immediately before redirect to WP checkout

All four events live in the existing `page_views` table (one row each), discriminated by the `page_type` column. Rationale: `page_views` already has `summit_id`, `funnel_id`, `funnel_step_id`, `visitor_session_id`, UTM, device, country. A parallel `funnel_events` table would duplicate all of that for no gain.

---

## Architecture

### Data layer

**No schema change to `page_views`.** Existing columns are sufficient. Add one index:

```sql
CREATE INDEX page_views_summit_type_created_idx
  ON page_views (summit_id, page_type, created_at);
```

Without this index, the `COUNT(*) FILTER (...)` queries below degrade to sequential scans as the table grows. Added in a new migration alongside the widget code.

### Tracking wires

| # | Event | Where it's fired | Change required |
|---|---|---|---|
| 1 | `optin` view | Next.js renders the optin page | Client POSTs to new endpoint `POST /api/track/page-view` with `page_type=optin` |
| 2 | `optin_submit` | `app/Http/Controllers/Api/OptinController@store` | After the existing `Optin::create(...)`, also write a `page_views` row with `page_type=optin_submit`. Same request, same session. |
| 3 | `sales` view | Next.js renders the sales page | Client POSTs to `/api/track/page-view` with `page_type=sales` |
| 4 | `checkout_click` | Sales-page CTA in Next.js | Client POSTs to `/api/track/page-view` with `page_type=checkout_click` **before** performing the WP redirect (fire-and-forget; redirect must not block on 2xx) |

The existing `RecordPageView` action already exists but has no callers. It is reused for (1), (2), (3), (4) — either directly (2) or via the new endpoint (1, 3, 4).

### New endpoint

`POST /api/track/page-view`

**Request body:**
```json
{
  "page_type": "optin" | "sales" | "checkout_click",
  "summit_id": "uuid",
  "funnel_id": "uuid",
  "funnel_step_id": "uuid"
}
```

(Note: `optin_submit` is NOT valid for this endpoint — that event is written server-side by `OptinController` only, so it cannot be faked by clients.)

**Behavior:**
- Validates `page_type` ∈ the 3 client-writable values.
- Validates summit/funnel/step UUIDs exist.
- Reads `visitor_session_id` from the existing session cookie (whatever mechanism already seeds `visitor_sessions`).
- Copies UTM params from the session, user-agent, IP, country from request headers.
- Returns `204 No Content`. Never returns data to client; analytics is write-only from the browser.

Rate-limited via Laravel's standard throttle middleware (60 req/min/IP is fine; real users won't hit it).

### Widgets

Three widgets render on `/admin/{domain}`, in order:

1. **`SummitsWidget`** — existing, unchanged.
2. **`LiveSummitsFunnelWidget`** — NEW. Shows one expanded card per summit where `pre_summit_starts_at <= now() AND ends_at >= now()`.
3. **`PastSummitsFunnelWidget`** — NEW. Shows one collapsed row per summit where `ends_at < now()`. Drawer expands on click and fetches the funnel data lazily.

Upcoming summits (`pre_summit_starts_at > now()`) appear only in `SummitsWidget`; they have no funnel data worth showing.

Dashboard registered in `App\Filament\Pages\Dashboard::getWidgets()`.

### Card contents (live summit)

```
ADHD Parenting Summit · live · Day 3 of 7

   Optin        Optin submit    Sales         Checkout
   views        (conversions)   views         clicks
   12,430  ─▶   3,821      ─▶   2,104    ─▶   489
            30.7%          55.1%          23.2%

[Leak alert: Optin→Sales lost 45% of optins.
 Industry benchmark: 70%+ reach sales page.]     ← only if below threshold
```

### Leak alert thresholds

| Conversion | Alert if below |
|---|---|
| optin view → optin submit | 20% |
| optin submit → sales view | 60% |
| sales view → checkout click | 10% |

Thresholds are hard-coded constants in the widget for Phase 1. If operators need per-summit overrides later, promote to config. Not before.

Happy path (all three above threshold): **no alerts shown**. The card stays clean.

---

## Query pattern

One query per summit card:

```sql
SELECT
  COUNT(*) FILTER (WHERE page_type = 'optin')          AS optin_views,
  COUNT(*) FILTER (WHERE page_type = 'optin_submit')   AS optin_submits,
  COUNT(*) FILTER (WHERE page_type = 'sales')          AS sales_views,
  COUNT(*) FILTER (WHERE page_type = 'checkout_click') AS checkout_clicks
FROM page_views
WHERE summit_id = ?
  AND created_at >= ?   -- summit.pre_summit_starts_at
```

The composite index above makes this a single index-only scan per summit.

### Caching

- Live summits: `Cache::remember("funnel:{summit_id}", 60, ...)` — 60-second TTL. Dashboards don't need real-time; flickering numbers are UX noise.
- Past summits: 24-hour TTL. Results don't meaningfully change.

Cache key includes `summit.updated_at` so edits to the summit invalidate it implicitly.

---

## Testing

Pest, feature-level, `RefreshDatabase`.

### Tracking endpoint

- `POST /api/track/page-view` with each of `optin`, `sales`, `checkout_click` creates one `page_views` row with the correct `page_type`.
- Unknown `page_type` (including `optin_submit`) → `422`, no row created.
- Missing summit/funnel/step → `422`.
- UTM + session + IP + user-agent are copied from the request.

### OptinController double-write

- `POST` to existing optin endpoint with valid payload creates:
  - one `optins` row (existing behavior, regression-guard)
  - one `page_views` row with `page_type = 'optin_submit'`, same `visitor_session_id` as the optin view that preceded it.

### LiveSummitsFunnelWidget

- Only renders summits where `pre_summit_starts_at <= now() <= ends_at`.
- Hides upcoming summits and past summits.
- Given seeded page_views: conversion % math matches hand-calculated expected values.
- Leak alert renders when step conversion is below threshold; hidden when above.
- Summit with zero views shows all four steps as `0` with no divide-by-zero crash.

### PastSummitsFunnelWidget

- Only renders summits where `ends_at < now()`.
- Card defaults to collapsed.
- Drawer expansion triggers funnel data fetch (assert via query count: collapsed = 0 funnel queries, expanded = 1).

---

## Files touched

**New:**
- `database/migrations/YYYY_MM_DD_add_page_views_summit_type_created_index.php`
- `app/Http/Controllers/Api/TrackPageViewController.php`
- `app/Filament/Widgets/LiveSummitsFunnelWidget.php`
- `app/Filament/Widgets/PastSummitsFunnelWidget.php`
- Blade partials for the two widgets under `resources/views/filament/widgets/`
- Next.js: client-side tracker helper + CTA wire-up in sales block(s) + optin block(s)
- Tests: `tests/Feature/Analytics/TrackPageViewTest.php`, `tests/Feature/Analytics/OptinSubmitTrackingTest.php`, `tests/Feature/Filament/LiveSummitsFunnelWidgetTest.php`, `tests/Feature/Filament/PastSummitsFunnelWidgetTest.php`

**Modified:**
- `app/Http/Controllers/Api/OptinController.php` — append page_views write after Optin::create
- `app/Filament/Pages/Dashboard.php` — register the two new widgets
- `routes/api.php` — add the new tracking route

---

## Deferred (Phase 2, when native checkout lands)

- Revenue panel (gross, net, refunds, AOV)
- Bump attach rate
- Upsell take rate
- UTM-segmented funnel view on the domain dashboard (the existing `UtmBreakdown` page covers this deeper dive already)
- Cross-summit comparison charts
- Per-summit override of leak alert thresholds
