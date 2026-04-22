# ActiveCampaign Optin Sync — Design Spec

**Date:** 2026-04-22
**Status:** Approved
**Scope:** Optin-to-AC sync with per-summit tags, list assignment, and failure tracking

---

## Problem

When a visitor opts in on a funnel page, they need to be synced to ActiveCampaign: added to a list, tagged with a summit-specific tag. The plumbing exists (Contact model, SyncOptinToActiveCampaign job, ActiveCampaignService) but:

1. List assignment is configured in Settings but never used by the sync job
2. Tags are hardcoded as env-level IDs — not per-summit
3. Sync failures are invisible — no status tracking, no retry mechanism
4. The boolean `activecampaign_synced` column loses context (no error message, no timestamp)

## Design

### Config model

| Setting | Where it lives | Why |
|---------|---------------|-----|
| AC API URL + Key | `.env` vars (`ACTIVE_CAMPAIGN_URL`, `ACTIVE_CAMPAIGN_KEY`) | Per-environment, sensitive credentials |
| AC List ID | `AppSettings` (Filament Settings page) | Shared across all summits, editable without redeploy |
| AC Optin Tag | `summits.ac_optin_tag` column (per-summit) | Each summit applies its own tag (e.g. "ATS1 APR26 SIGNUP") |

**Removed:** `ACTIVE_CAMPAIGN_OPTIN_TAG_ID` and `ACTIVE_CAMPAIGN_PRODUCT_TAG_ID` env vars. Tags are now derived from summit config, not env.

### Migration: `add_ac_optin_tag_to_summits_table`

- Add `ac_optin_tag` (VARCHAR 255, nullable) to `summits` table

### Migration: `update_ac_sync_columns_on_optins_table`

- Add `ac_sync_status` (VARCHAR 20, default `'pending'`) to `optins`
- Add `ac_sync_error` (TEXT, nullable) to `optins`
- Add `ac_synced_at` (TIMESTAMP, nullable) to `optins`
- Backfill: rows where `activecampaign_synced = true` get `ac_sync_status = 'synced'`
- Drop `activecampaign_synced` column

### ActiveCampaignService changes

Add methods:

```
addContactToList(string $contactId, string $listId): void
  POST /api/3/contactLists { contact: $contactId, list: $listId, status: 1 }

findOrCreateTagByName(string $tagName): string
  GET /api/3/tags?search=$tagName → if found, return ID
  POST /api/3/tags { tag: { tag: $tagName, tagType: 'contact' } } → return ID
```

Existing `syncContactWithTags` stays but the job calls individual methods for clarity.

### SyncOptinToActiveCampaign job changes

Updated flow:

1. Load optin with `summit` and `contact` relationships
2. Read `ac_optin_tag` from summit — if null, skip sync entirely (no-op, set status to `synced`)
3. Read `activecampaign_list_id` from AppSettings
4. Call `findOrCreateContact()` (existing)
5. Call `findOrCreateTagByName(summit.ac_optin_tag)` to get tag ID
6. Call `addTag(contactId, tagId)` (existing)
7. If list ID is set, call `addContactToList(contactId, listId)`
8. On success: `ac_sync_status = 'synced'`, `ac_synced_at = now()`, clear `ac_sync_error`, store `ac_contact_id` on Contact
9. On final failure (after 3 retries): `ac_sync_status = 'failed'`, store error message in `ac_sync_error`

Retry config stays: 3 tries, backoff `[10, 60, 300]`.

### Filament: Summit edit form

Add collapsible "ActiveCampaign" section at bottom of Summit form:

- `ac_optin_tag` — TextInput, placeholder "e.g. ATS1 APR26 SIGNUP", helper text "Tag applied to contacts who opt in to this summit"

### Filament: Optins table

Add to the existing optins/contacts table:

**Columns:**
- `ac_sync_status` — BadgeColumn (green = synced, red = failed, gray = pending)
- `ac_sync_error` — hidden by default, shown as tooltip on failed badge
- `ac_synced_at` — DateTimeColumn, since-format

**Row action (failed rows):**
- "Retry AC Sync" — resets `ac_sync_status` to `pending`, clears error, re-dispatches `SyncOptinToActiveCampaign`

**Bulk action:**
- "Retry Failed Syncs" — selects all failed, dispatches jobs, resets statuses

**Table filter:**
- "AC Status" — select filter with options: all / pending / synced / failed

### What's NOT in scope

- Purchase/order sync to AC (future)
- AC custom field updates (future)
- Dropdown tag picker fetched from AC API (future enhancement)
- Per-funnel tag overrides (summit-level is sufficient for now)
- Brevo/email automation triggers

## Test plan

1. **Unit: SyncOptinToActiveCampaign job** — mock AC service, verify it reads tag from summit, calls list assignment, sets status columns correctly on success and failure
2. **Unit: ActiveCampaignService** — test `findOrCreateTagByName` and `addContactToList` with HTTP fakes
3. **Feature: OptinController** — verify job is dispatched with correct optin, status starts as `pending`
4. **Feature: Retry action** — verify re-dispatch resets status and dispatches new job
5. **Existing tests** — update to use new `ac_sync_status` enum instead of boolean
