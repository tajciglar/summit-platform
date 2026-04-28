# Admin Refactor Spec — 2026-04-28

Scope: 30 items captured in conversation 2026-04-28. Grouped into 7 areas. Each item is independently shippable. Acceptance criteria are testable assertions — "done = the assertion holds".

---

## Area 1 — Dashboard

### 1.1 Show only live summits

- Dashboard summit list filters out summits whose end date is in the past.
- Columns: name, start date, end date, status, phase, funnels count, speakers count, actions (view, edit, remove).
- **Done when:** loading `/admin` shows zero rows for any summit with `event_end_date < today`.

### 1.2 Nested analytics per summit

- Each summit row is expandable; expanding reveals an inline analytics panel for that summit (registrations, optins, sales, revenue at minimum).
- **Done when:** clicking a summit row expands an analytics block scoped to that summit's IDs only.

---

## Area 2 — Sidebar

### 2.1 Restructure "Summit" group

- Sidebar "Summit" group lists live summits as direct children, plus a single "Manage summits" entry at the bottom.
- "Manage summits" uses a different icon than the parent calendar (e.g. `Cog6Tooth` or `Squares2x2`) so it doesn't visually duplicate the group icon.
- **Done when:** sidebar shows: `[calendar] Summit` → `[•] Live Summit A`, `[•] Live Summit B`, `[different icon] Manage summits`.

### 2.2 Remove "+ New summit" button

- Remove the `+ New summit` sidebar entry entirely. Creation moves into the "Manage summits" page (existing Filament Create action).
- **Done when:** no sidebar element with label "+ New summit" exists.

---

## Area 3 — Media Library

### 3.1 Bulk upload → per-photo categorization form

- Upload supports multi-file selection.
- After upload, the form lists each uploaded photo as a row with: thumbnail, normalized title, **required** category dropdown.
- Submission saves only when every row has a category.
- **Done when:** uploading 5 photos in one go produces 5 rows; saving without a category on any row blocks submission with a validation error.

### 3.2 Auto-name from filename

- On upload, photo title = filename minus extension, with `-` and `_` replaced by spaces, then title-cased.
- Example: `my-photo_v2.JPG` → `My Photo V2`.
- **Done when:** unit test on the normalizer asserts the example transform.

### 3.3 Single "pages" category for landing pages

- Existing `MediaCategory` enum: keep `hero`, `product`, `downloadables`, etc. Replace any per-page-type subcategorization for landing pages with a single `pages` category.
- **Done when:** landing-page photos categorize as `pages`; no sub-category prompt appears for that category.

### 3.4 Make media library global (not per-domain)

- Drop `domain_id` scoping on media records.
- Filament UI removes domain filter; all photos visible to all operators.
- **Done when:** a photo uploaded under one domain context appears in the library when another domain is active.

---

## Area 4 — Speakers

### 4.1 Replace top tab strip with summit dropdown

- Remove the per-summit tabs at top of speakers list.
- Replace with a multi-select summit dropdown ("All speakers" default) that filters the table.
- **Done when:** speakers page has no tab strip; filter is a dropdown above the table.

### 4.2 Multi-summit speaker model (M2M with per-pivot fields)

- **Global fields** stay on `speakers` table: name, photo, country, bio, social links.
- **Per-summit fields** live on `speaker_summit` pivot: `day_number`, `masterclass_title`, `talk_title`.
- Edit Speaker form uses a "Summits" Repeater — each row = one pivot attachment.
- Bulk action "Attach to summit…" copies global fields only; pivot fields start blank.
- **Done when:** one speaker row can have 2+ pivot rows with different `talk_title` values per summit; bulk-attach to a new summit creates a pivot with global data only.

### 4.3 Speakers list shows only Name + Summits

- Columns: Name, Summits (badges showing each attached summit, optionally with day number).
- Remove all other columns from list view.
- **Done when:** speakers list table has exactly 2 data columns plus actions.

### 4.4 Drop `goes_live_at` and `is_featured`

- Migration drops both columns from `speakers` (and pivot if present).
- Remove from Filament forms, tables, casts, factories, seeders.
- Remove from Next.js template renderers and any conditional rendering keyed off them.
- **Done when:** repo grep for `goes_live_at` and `is_featured` returns zero hits in `app/`, `database/`, `next-app/src/`.

### 4.5 Hide masterclass column from list

- `masterclass_title` stays in DB and on the per-pivot edit form.
- Remove from speakers list table column set.
- **Done when:** masterclass column not visible in list; still editable via Repeater.

---

## Area 5 — Products

### 5.1 Rename `standalone` → `main` in `product_kind` enum

- Postgres ENUM update: rename value `standalone` → `main`.
- Update all PHP references (model constants, scopes, Filament Select options, Stripe checkout logic, tests).
- Update Filament label "Standalone" → "Main products".
- **Done when:** `product_kind` enum has `main, bump, upsell, combo`; existing rows migrated; test suite green.

### 5.2 Combos (clarification, no code change)

Combos are documented behavior:
- One `Product` row with `kind = 'combo'`.
- `bundled_product_ids` JSONB array references child product IDs.
- `combo_discount_cents` is order-level discount applied at checkout.
- At checkout, combo expands into N Stripe line items (one per child's `stripe_price_id`); combo itself has no Stripe price.
- Frontend: shown as one product card; price = sum of children's phase prices − discount (never below 0).

No acceptance criteria — this is a clarification entry.

---

## Area 6 — CRM / Contacts

### 6.1 Default sort: latest first

- Contacts list ordered by `created_at DESC` by default.
- **Done when:** first row's `created_at` ≥ second row's.

### 6.2 Summit filter in toolbar

- Replace search bar position with combined filter strip: search + summit multi-select dropdown + date range picker.
- **Done when:** selecting a summit narrows the list to contacts attached to that summit.

### 6.3 Date range filter (created_at)

- Date range picker filters by `contacts.created_at`.
- **Done when:** picking 2026-01-01 to 2026-03-02 returns only contacts created in that window.

### 6.4 Buyers / Not-buyers column + filter

- New column "Buyer" — boolean derived from "has at least one paid order".
- Filter toggle: All / Buyers / Not buyers.
- **Done when:** filter `Buyers` returns only contacts with at least one `orders.status = paid` row.

### 6.5 Contact detail fields

- Per-contact view shows: email, first name, country, total revenue (sum of paid orders), Summits column (multi-row cell — one row per attached summit).
- **Done when:** opening a contact attached to 3 summits shows 3 summit rows in the Summits cell.

### 6.6 Bulk action checkboxes

- First column = checkbox.
- Bulk actions: delete, edit, view.
- **Done when:** selecting rows enables a bulk-action toolbar with those 3 actions.

### 6.7 CSV export

- "Export CSV" button at top of table.
- Export respects all currently applied filters (summit, date range, buyer status, search).
- **Done when:** filtering to "Buyers, summit X, Jan–Feb 2026" then exporting produces a CSV with exactly those rows.

---

## Area 7 — Funnels & Steps

### 7.1 Replace phase enum with 4 lifecycle values

New enum values:
- `summit_starts` — date summit is published for optins
- `summit_live` — event is running (e.g. 3.5–5.5)
- `open_all_pages` — post-event all-access window (all day videos open)
- `summit_end` — event ended, price increases

Migration maps existing phase values → new values (mapping table TBD per current data).

- **Done when:** every existing funnel/step row has a valid new-enum value; no orphan old values remain.

### 7.2 Remove "search by" UI element

- **Done when:** funnels list page has no "search by" control.

### 7.3 Slim funnels-in-summit-view columns

- In summit → Funnels tab, remove columns: slug, phase, step.
- **Done when:** funnels table within summit view shows reduced column set.

### 7.4 Notes on funnels

- Add `notes` text column on `funnels`.
- Filament edit form: rich text or textarea.
- List column: clickable cell/icon → opens modal showing full notes; cell preview is truncated.
- **Done when:** clicking the notes cell opens a modal with full text.

### 7.5 Move "Open live" out of summit View header

- Remove "Open live" button from summit View page header (keep Edit, Delete).
- "Open live" remains on funnels list (per-row action).
- **Done when:** summit View header has no "Open live" button.

### 7.6 AC tag moves from summit-level → funnel-level

- Drop `ac_tag` (or equivalent) from `summits` table.
- Add `ac_tag` to `funnels` table.
- Update ActiveCampaign sync logic to read tag from funnel, not summit.
- Show as column in funnels list.
- Migrate existing summit tags onto each summit's funnels (TBD: copy to all funnels of that summit, then operator edits).
- **Done when:** funnels table has `ac_tag` column; AC sync uses it; summit form no longer has tag input.

### 7.7 Funnel-steps view cleanup

- Remove "+ New step" button from top of funnel-steps view (keep the "Add new step" button below the list).
- Remove `summit_live` and `phase` columns from funnel-steps table.
- **Done when:** only one new-step entry point exists (below the list); two columns dropped.

### 7.8 Funnel edit form cleanup

- Remove fields from funnel edit form: live, phase, summit category, skin, description.
- **Done when:** funnel edit form does not render those 5 inputs.

### 7.9 Duplicate funnel row action

- Row action "Duplicate" on funnels list → modal with:
  - Template/skin dropdown (defaults to source funnel's skin)
  - Destination summit dropdown (defaults to source's summit)
- All steps and content (block content, copy, products) copy over.
- New funnel inherits chosen skin; content is unchanged.
- **Done when:** duplicating a funnel into a different summit produces a new funnel with identical step content but the chosen skin applied.

---

## Area 8 — Analytics (Google Analytics + GTM)

### 8.1 Per-domain GA4 + GTM IDs on `Domain` model

- Add columns: `ga4_measurement_id` (string, nullable), `gtm_container_id` (string, nullable).
- Filament Domain edit form exposes both.
- **Done when:** each Domain row carries its own pair of IDs.

### 8.2 Client-side GA4 + GTM injection

- Next.js template `<head>` includes GA4 + GTM tags using the resolved domain's IDs.
- Skipped when both IDs are null.
- Standard GA4 events fire client-side: pageview (auto), `optin_submit`, `checkout_start`, `purchase` (client-side too, for engagement only — see 8.3 for source-of-truth purchase).
- **Done when:** loading a public funnel page from a domain with IDs set fires GA4 + GTM tags visible in browser network tab.

### 8.3 Server-side Measurement Protocol for money events

- Stripe webhook handler fires `purchase` and `refund` events to GA4 Measurement Protocol API for the relevant domain's measurement ID.
- Events include real revenue, currency, item line, transaction_id.
- Shares `client_id` with the client-side session (passed through optin/checkout flow) so GA stitches into one user journey.
- **Done when:** completing a Stripe test purchase produces both a client-side `purchase` event AND a server-side Measurement Protocol call with matching `client_id` and `transaction_id`. Refunding via Stripe dashboard fires server-side `refund` event.

---

## Out of scope

- AI funnel generation tweaks
- Bunny CDN migration
- New template development
- Bump editor redesign

## Execution order (recommended)

1. Area 5 (Products enum rename) — DB migration, smallest blast radius
2. Area 4 (Speakers M2M cleanup) — schema + Filament UX
3. Area 1 + 2 (Dashboard + Sidebar) — UI only
4. Area 3 (Media Library) — schema + UX
5. Area 6 (CRM) — list page additions
6. Area 7 (Funnels) — biggest, multi-touch
7. Area 8 (Analytics) — last, depends on settled domain model

Each area = its own feature branch + PR.
