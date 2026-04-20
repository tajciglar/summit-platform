# Design: Next.js Landing + Sales Pages → WordPress/FunnelKit Checkout Flow

**Date:** 2026-04-20  
**Branch:** golden/aps-parenting  
**Status:** Approved

---

## Overview

Migrate the top of the funnel (landing page + sales page) from WordPress/FunnelKit to Next.js served by this platform. The checkout, order bumps, upsells, and thank-you pages remain in WordPress/FunnelKit temporarily. A future phase will migrate checkout to Stripe entirely, at which point FunnelKit is dropped.

**Target domain:** `parenting-summits.com`  
**Checkout domain:** `althea-academy.com` (WordPress/FunnelKit)

---

## Full Funnel Flow

```
Visitor → parenting-summits.com/{funnel-slug}
  │
  ▼
Next.js Landing Page  (step: optin)
  │  OptinFormBlock: first_name + email
  │  POST /api/optins → Laravel
  │     ├─ Upsert Contact by email
  │     ├─ Create Optin record (funnel, UTM, IP)
  │     ├─ Dispatch SyncToActiveCampaign job
  │     └─ Return { redirect: "/{funnel-slug}/sales?email=...&first_name=..." }
  │
  ▼
Next.js Sales Page  (step: sales)
  │  Reads email + first_name from URL params (client-side)
  │  "Buy Now" CTA → FunnelKit checkout URL + billing params
  │     althea-academy.com/checkout/{product}
  │       ?billing_email=...&billing_first_name=...
  │
  ▼
WordPress / FunnelKit  (unchanged)
  ├─ Checkout with order bump
  ├─ Upsell
  └─ Thank You
```

---

## Phase 2 Migration Path (future)

When FunnelKit is dropped:
- Sales page CTA points to Laravel/Stripe checkout instead
- On purchase: look up Contact by email → create Order linked to Contact
- No structural changes needed — Contact model is already the central identity record

---

## Backend (Laravel)

### Data Model

**`contacts` table**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| email | string unique | deduplicated identity |
| first_name | string | |
| last_name | string nullable | |
| ac_contact_id | string nullable | ActiveCampaign contact ID |
| created_at / updated_at | timestamps | |

**`optins` table**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| contact_id | FK → contacts | |
| funnel_id | FK → funnels | |
| ip_address | string nullable | |
| utm_source | string nullable | |
| utm_medium | string nullable | |
| utm_campaign | string nullable | |
| utm_content | string nullable | |
| utm_term | string nullable | |
| created_at | timestamp | |

**`orders` table (existing — add nullable FK)**
- Add `contact_id` (nullable FK → contacts) — filled during Phase 2 Stripe migration

### API Endpoint

`POST /api/optins`

**Request:**
```json
{
  "first_name": "Jane",
  "email": "jane@example.com",
  "funnel_id": 1,
  "utm_source": "facebook",
  "utm_medium": "paid",
  "utm_campaign": "aps25"
}
```

**Response (200):**
```json
{
  "redirect": "/aps25/sales?email=jane%40example.com&first_name=Jane"
}
```

**Validation:**
- `first_name`: required, string, max 100
- `email`: required, email, max 255
- `funnel_id`: required, exists in funnels table

**Rate limiting:** 5 requests / minute per IP

### ActiveCampaign Sync Job

`SyncToActiveCampaign` job (dispatched async):
- Upsert contact in AC by email (create or update)
- Apply tag: `optin:{funnel-slug}` (e.g. `optin:aps25`)
- Add to AC list ID configured per funnel (stored on `funnels` table as `ac_list_id`)
- Store returned `ac_contact_id` on the Contact record
- Env vars: `ACTIVE_CAMPAIGN_URL`, `ACTIVE_CAMPAIGN_KEY`

### Filament Resources

**ContactResource** (`/admin/contacts`)
- Table: email, first_name, optins count, created_at — searchable, sortable
- Detail view: contact info + optins relation manager + orders relation manager (for Phase 2)
- Read-only (no manual create/edit)

**OptinResource** (relation manager on Contact, also standalone `/admin/optins`)
- Table: contact email, funnel name, utm_source, created_at
- Filters: by funnel, by date range, by utm_source
- No create/edit — read-only

**Stats widget on dashboard:**
- Total optins (all time + today)
- Optins per funnel (last 30 days)
- Top UTM sources

---

## Next.js Side

### Environment Variables

```env
NEXT_PUBLIC_LARAVEL_API_URL=https://api.parenting-summits.com   # or current Laravel URL
NEXT_PUBLIC_FUNNELKIT_CHECKOUT_URL=https://althea-academy.com/checkout/vip-pass
```

### OptinFormBlock update

The existing `OptinFormBlock` component is updated to:
1. Accept `funnelId` as a block prop (set in Filament)
2. POST `{ first_name, email, funnel_id, utm_* }` to `${NEXT_PUBLIC_LARAVEL_API_URL}/api/optins`
3. Read UTM params from `window.location.search` at submit time
4. On success: `router.push(response.redirect)` — follows Laravel's redirect URL
5. On error: display inline field-level validation messages
6. Loading state on submit button

### Sales Page CTA

Client-side hook `useCheckoutUrl()`:
- Reads `email` + `first_name` from `useSearchParams()`
- Returns `${NEXT_PUBLIC_FUNNELKIT_CHECKOUT_URL}?billing_email=...&billing_first_name=...`
- All "Buy Now" / "Get Access" buttons on the sales page use this hook

---

## Funnel Setup (parenting-summits.com)

In Filament:
1. Add domain `parenting-summits.com` → `/admin/domains`
2. Create funnel `aps25` linked to that domain → `/admin/funnels`
3. Add two funnel steps:
   - `optin` (type: optin) — landing page blocks
   - `sales` (type: sales) — sales page blocks
4. Generate/build page content for each step
5. Publish both steps

---

## What Is NOT Changed

- WordPress/FunnelKit checkout flow — untouched
- Existing `Order` model Stripe flow — untouched (contact_id added as nullable only)
- Existing funnel page rendering in Next.js — same catch-all route, same block system
- Existing AC sync job structure — extended, not rewritten

---

## Success Criteria

- [ ] Visitor opts in on `parenting-summits.com` → record appears in Filament contacts + optins
- [ ] Contact appears in ActiveCampaign with correct tag
- [ ] Visitor lands on sales page with email pre-populated in Buy Now URL
- [ ] Clicking Buy Now lands on FunnelKit checkout with `billing_email` + `billing_first_name` pre-filled
- [ ] UTM params from landing page URL are captured on the Optin record
- [ ] Rate limiting blocks > 5 submissions/min per IP
