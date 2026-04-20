# Landing Page Drafts — Workflow Redesign (Filament)

**Date:** 2026-04-20
**Status:** Draft — awaiting user review

## Context

A live `Livewire\Exceptions\MethodNotFoundException: Public method [deleteDraft] not found on component` surfaces on `/admin/<domain>/funnel-steps/<id>/edit` when operators click Delete on a draft. The root cause is that `publishDraft` and `deleteDraft` are defined only on `ViewFunnelStep` (`app/Filament/Resources/FunnelSteps/Pages/ViewFunnelStep.php:48,64`), yet the same partial (`resources/views/filament/components/landing-pages-list.blade.php:95,112`) is embedded in three places: the Step View page, the Step Edit page, and `ManageLandingPageBatches`.

The crash is a symptom of a deeper structural problem: the landing-page-drafts feature spans four inconsistent admin surfaces (`GenerateLandingPagesPage`, `LandingPageDraftsPage`, `ManageLandingPageBatches`, and the drafts partial on each FunnelStep page), each with its own Livewire methods, routing, and UX. Status values are also fragmented — the migration defaults drafts to `pending` (`database/migrations/2026_04_17_100011_create_landing_page_tables.php:54`), but live code paths write `queued`, `generating`, `ready`, `shortlisted`, `published`, `failed`, and `archived`.

This redesign ships a single canonical workflow: drafts become a `RelationManager` tab on the Funnel, generation is a Filament header Action modal, step pages focus on the published page, and the three legacy surfaces are retired. The hotfix lands first to unblock the live crash.

## Decisions (locked with user)

1. **Canonical home:** `LandingPageDraftsRelationManager` attached to `FunnelResource`.
2. **Step page:** removes all draft-list UI; adds a read-only "Live landing page" card summarizing the currently published draft.
3. **Generate flow:** Filament header `Action` on the Drafts RelationManager, opens a modal.
4. **Edit flow:** keeps the dedicated `EditLandingPageDraftPage` (Builder needs screen real-estate); row "Edit" action links to it.
5. **Retired:** `GenerateLandingPagesPage`, `LandingPageDraftsPage`, `ManageLandingPageBatches`.
6. **Reused as-is:** `LandingPageDraft` model, `PublishDraftService`, `GenerateLandingPageBatchJob`, `TemplateRegistry`, `TemplateSelector`.

## Status enum consolidation

The current status strings are scattered across jobs, services, and partials. Consolidate into an enum as part of this work:

```php
// app/Enums/LandingPageDraftStatus.php
enum LandingPageDraftStatus: string {
    case Queued = 'queued';
    case Generating = 'generating';
    case Ready = 'ready';
    case Shortlisted = 'shortlisted';   // operator flag: "worth considering"
    case Published = 'published';
    case Failed = 'failed';
    case Archived = 'archived';
}
```

Migration step:
- `UPDATE landing_page_drafts SET status = 'queued' WHERE status = 'pending'` — rename the inherited default.
- Add a cast on `LandingPageDraft::$casts`: `'status' => LandingPageDraftStatus::class`.
- Replace the raw string writes in `GenerateLandingPageVersionJob`, `GenerateLandingPageBatchJob`, `GenerateLandingPagesPage`, `LandingPageDraftsPage`, and `PublishDraftService` with enum cases.
- Remove the switch-on-string blocks in `landing-pages-list.blade.php` (partial is deleted anyway — the new RelationManager uses `TextColumn::make('status')->badge()->formatStateUsing(...)`).

## UI design

### 1. Funnel Drafts tab (`LandingPageDraftsRelationManager`)

**Attaches via:** `FunnelResource::getRelations(): array` returning `[LandingPageDraftsRelationManager::class]`. Since `LandingPageDraft` does not `belongTo Funnel` directly (it goes through `LandingPageBatch`), override `getRelationshipName()` / the Eloquent query to resolve via batch: `LandingPageDraft::whereHas('batch', fn ($q) => $q->where('funnel_id', $funnel->id))`.

**Table columns:**

| Column | Source | Display |
|---|---|---|
| `template_key` | `template_key` | Two-line cell: `TemplateRegistry::get(key)['label']` in bold + `key` in monospace gray + 5-swatch `palette` strip underneath |
| `version_number` | `version_number` | `v{n}`, tabular-nums, sortable |
| `audience` | `audience` (SummitAudience enum) | Badge with audience-specific dot color, formatted via enum's `label()` |
| `status` | `status` (LandingPageDraftStatus enum) | Filament `badge()` column; color map `published=success, ready/shortlisted=info, generating/queued=warning, failed=danger, archived=gray` |
| `created_at` | `created_at` | `->since()`, sortable, default sort desc |

Toggleable column (hidden by default): `batch.id` short hash — helps operators group drafts from the same generation batch when debugging.

**Row actions** (grouped by Filament default into a trailing action cell, no `ActionGroup` menu — keeps it one click):

- `Action::make('view')` — opens `{config('next.url')}/preview/{preview_token}` in new tab. Hidden when `preview_token` is null.
- `Action::make('edit')` — URL = `EditLandingPageDraftPage::getUrl(['record' => $funnel, 'draft' => $draft->id])`.
- `Action::make('publish')` — calls `app(PublishDraftService::class)->publish($draft, auth()->user())` inside `->action()`. Confirmation: `requiresConfirmation()->modalHeading('Publish this variant as the live landing page?')`. `visible(fn ($record) => in_array($record->status, [Ready, Shortlisted]))`.
- `DeleteAction` — Filament default, hard delete (`LandingPageDraft` has no SoftDeletes).

Text labels on all buttons — no emoji icons. Delete renders as a ghost `×` button (small square, turns red on hover) to avoid competing visually with the other actions.

**Header action:**

- `Action::make('generate')->label('Generate variants')` — opens the modal (spec below). Primary button styling.

**Filters:**

- `SelectFilter::make('status')` — all `LandingPageDraftStatus` cases.
- `SelectFilter::make('audience')` — all `SummitAudience` cases.
- `SelectFilter::make('template_key')` — options resolved from `TemplateRegistry::all()->keys()`.

**Failed-drafts banner:** when any draft in the current funnel has status `failed`, show a single Filament notification above the table: `<n> draft(s) failed — see row details for error messages`. Renders from a `$this->getTable()->header(...)` closure.

**Empty state:** heading "No drafts yet", subheading "Click Generate variants to kick off AI generation", primary button mirrors the header action.

**Sort:** default `created_at desc`.

### 2. Generate variants modal

**Form schema** (Filament `Action::make('generate')->schema([...])`):

| Field | Filament type | Notes |
|---|---|---|
| `audience_override` | `Select::make` | Options = `SummitAudience::cases()` mapped via `->label()`. Default = `$funnel->summit->audience`. Help text: "Determines copy tone and resolved palette tokens." |
| `template_selections` | custom `Repeater::make` OR a view field | Multi-row: each row has `Checkbox` (selected) + `TextInput` (version count, 1–5, default 1). Renders `TemplateRegistry::all()` with `label`, `key`, and palette swatches inline. |
| `style_reference_url` | `TextInput::make`->url() | Help: "URL or reference image. AI will mirror its typography, spacing, and layout rhythm." |
| `style_reference_image` | `FileUpload::make` | Optional, stored on `public` disk under `style-refs/`, 10 MB cap, image MIME only. |
| `notes` (advanced) | `Textarea::make`->collapsed() | 3 rows, optional. |

**Submit:** action handler creates a `LandingPageBatch` with `template_pool` = selected keys, plus a new column `versions_per_template` (JSON map `{key: count}`) so the job honors per-template counts. Dispatches `GenerateLandingPageBatchJob::dispatch($batch->id)` (unchanged), then sends a Filament notification "Kicked off N variants across M templates".

**Footer summary** below the form: a live string "Will generate **N variants** across **M templates**. Est. time: ~{N × 90}s." computed from form state.

**Schema migration for per-template counts:** add `versions_per_template` JSON column to `landing_page_batches`. Update `GenerateLandingPageBatchJob::handle` to dispatch per `(template_key, count)` pair. Existing job already loops over `template_pool` × `version_count` — extend the loop to honor per-key counts, fall back to `version_count` when the map is null (backwards-compatible).

### 3. FunnelStep edit page redesign

Replace the current flat form + embedded drafts partial with three Filament `Section`s:

**Section 1 — "Live landing page"** (`expanded`, primary visual weight):

**Step-type scope:** only rendered when `step_type === 'optin'`. `PublishDraftService` writes exclusively to the optin step of a funnel; upsell/thankyou/checkout steps hold hand-authored `page_content` unrelated to the drafts pipeline. For non-optin steps, Section 1 is omitted entirely and Section 2 becomes the primary section.

Rendered via a `ViewField` pointing at `resources/views/filament/components/live-landing-card.blade.php` (new). Data:
- Resolved from `$funnel->drafts()->where('status', Published)->latest('updated_at')->first()` — there is at most one published draft per funnel because `PublishDraftService` archives previous ones. Expose as `Funnel::publishedDraft()` `HasOneThrough` relation through `LandingPageBatch`.
- Displays: 140×88 preview thumbnail (rendered as CSS gradient placeholder for now; Phase 2 could fetch a real screenshot from `published_html`), status dot, "Published {time} ago by {user}", template label `·` version, audience, 5-swatch palette strip from `palette` column.
- Actions column: `Preview` (opens `preview_token` URL) + `Go to Drafts` (links to `FunnelResource::getUrl('edit', ['record' => $funnel]) . '?tab=drafts'`).

**Empty state (optin step with no published draft yet):** dashed-border box with "No live landing page yet — publish a draft from the **Drafts** tab." + primary button linking to the Drafts tab of the parent Funnel.

**Section 2 — "Step details"** (`expanded`):

Existing fields, laid out 3-column:

| Row 1 | `name`, `slug`, `sort_order` |
| Row 2 | `step_type`, `product_id`, `is_published` (toggle) |

No change to fields themselves — only layout and the fact that this section is no longer buried under draft scaffolding.

**Section 3 — "Page content blocks"** (`collapsed` by default):

The existing Filament `Builder` on `page_content`. Section header shows block count: `"Page content blocks — {count} blocks"`. Collapsed to prevent overwhelming editors; power users expand when fine-tuning post-publish.

## Hotfix (ships first, independently)

**Goal:** stop the live `MethodNotFoundException` without touching structure.

**Change:** extract `publishDraft(string $draftId): void` and `deleteDraft(string $draftId): void` from `ViewFunnelStep` into:

```php
app/Filament/Concerns/ManagesLandingPageDrafts.php
```

Include the trait on:
- `App\Filament\Resources\FunnelSteps\Pages\ViewFunnelStep`
- `App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep` (the crash site)
- `App\Filament\Resources\Funnels\Pages\ManageLandingPageBatches` (the third consumer)

Test with `tests/Feature/ManageLandingPageBatchesEditorTest.php` pattern — add analogous tests for Edit and View pages that call `deleteDraft` and assert the draft is removed.

## Affected files

**New:**
- `app/Filament/Concerns/ManagesLandingPageDrafts.php` — trait with `publishDraft` / `deleteDraft`. Hotfix commit.
- `app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php` — the Drafts tab.
- `app/Enums/LandingPageDraftStatus.php` — consolidated status enum.
- `resources/views/filament/components/live-landing-card.blade.php` — Step page summary card.
- `database/migrations/YYYY_MM_DD_add_versions_per_template_to_landing_page_batches.php`.
- `database/migrations/YYYY_MM_DD_normalize_landing_page_draft_status.php` — `UPDATE landing_page_drafts SET status='queued' WHERE status='pending'`.

**Modified:**
- `app/Filament/Resources/Funnels/FunnelResource.php` — add `getRelations()`.
- `app/Filament/Resources/Funnels/FunnelResource.php` — remove route registrations for the retired pages.
- `app/Filament/Resources/FunnelSteps/FunnelStepResource.php` — rebuild the form schema into three Sections.
- `app/Models/LandingPageDraft.php` — cast status to enum.
- `app/Jobs/GenerateLandingPageVersionJob.php`, `app/Jobs/GenerateLandingPageBatchJob.php` — enum references.
- `app/Services/Templates/PublishDraftService.php` — enum references.

**Deleted:**
- `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php`
- `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php`
- `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php` (and its Blade view)
- `resources/views/filament/components/landing-pages-list.blade.php`
- `resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php`

**Preserved:**
- `app/Services/Templates/PublishDraftService.php` — signature unchanged.
- `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php` — still the draft-content editor, reached from the RelationManager row action.
- `next-app/public/template-manifest.json` — drives template label + palette surfacing.

## Verification plan

1. **Reproduce the crash first:** navigate to `/admin/althea-academy/funnel-steps/<id>/edit`, click Delete on a draft row. Confirm `MethodNotFoundException` before any code change.
2. **After hotfix:** same click → draft deleted, Filament notification "Draft deleted" shown. Run `php artisan test --compact --filter=ManagesLandingPageDrafts`.
3. **After RelationManager ships:** from Funnel edit → Drafts tab:
   - Generate variants → `LandingPageBatch` created → drafts appear with status `queued` → status transitions to `generating` → `ready` as job runs.
   - Publish a `ready` draft → `FunnelStep.page_content` updated; draft's status flips to `published`; previously-published drafts in same funnel flip to `archived`.
   - Preview URL in new tab renders the published content via `next-app`.
   - Delete removes the row. Filters work. Failed-drafts banner appears when any row is `failed`.
4. **Step page:** navigate to any step whose funnel has a published draft → "Live landing page" card shows correct template label, version, palette, audience, publish timestamp. "Go to Drafts" link returns to the Funnel Drafts tab. Collapsed Page-content section still lets editors tweak blocks after expand.
5. **Pest feature tests** using `livewire(EditFunnel::class, ['record' => $funnel])->assertRelationManagerExists(LandingPageDraftsRelationManager::class)` pattern. Add:
   - Table assertion for draft visibility.
   - `->callTableAction('generate', data: [...])` — asserts batch + drafts created.
   - `->callTableAction('publish', record: $draft)` — asserts `page_content` updated and archive.
   - `->callTableAction('delete', record: $draft)` — asserts row deleted.

## Delivery sequence

| # | Commit | Scope |
|---|---|---|
| 1 | **hotfix(filament):** extract ManagesLandingPageDrafts trait | Unblocks the live crash. Zero structural change. |
| 2 | **feat(filament):** LandingPageDraftStatus enum + migration | Consolidate status strings; make enum the source of truth. |
| 3 | **feat(filament):** LandingPageDraftsRelationManager | New Drafts tab on Funnel edit; table + row actions + filters. |
| 4 | **feat(filament):** Generate variants action modal | Replaces `GenerateLandingPagesPage`; adds `versions_per_template`. |
| 5 | **refactor(filament):** retire legacy draft pages | Delete `GenerateLandingPagesPage`, `LandingPageDraftsPage`, `ManageLandingPageBatches`, partial. |
| 6 | **feat(filament):** FunnelStep page redesign | Three-section layout + live-landing card. |

Each commit ships with its own Pest tests. `php artisan test --compact` must pass between every commit.

## Out of scope

- Real screenshot thumbnails of the live landing page (the card uses a CSS placeholder for now).
- Shareable `preview_token` links for stakeholder review outside admin.
- Draft versioning / rollback UI beyond the existing `FunnelStepRevision` snapshot.
- A/B testing harness — split traffic between published variants. Future work once the data model stabilizes.
