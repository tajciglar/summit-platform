# Landing Page Drafts — Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate four fragmented landing-page-drafts admin surfaces into one Filament `RelationManager` on the Funnel, eliminate the live `MethodNotFoundException` crash on `EditFunnelStep`, and give FunnelStep pages a clean "Live landing page" summary card.

**Architecture:** Drafts become a `LandingPageDraftsRelationManager` attached to `FunnelResource`. Generation is a header `Action` modal. Status strings consolidate into `LandingPageDraftStatus` enum. The sophisticated `publishDraft`/`deleteDraft` logic currently on `ManageLandingPageBatches` moves into a `ManagesLandingPageDrafts` trait (used by the hotfix, then by the RelationManager). Three legacy Filament pages and two Blade partials get deleted.

**Tech Stack:** Laravel 13 · PHP 8.3 · Filament v4 · Livewire v3 · Pest v4 · PostgreSQL

---

## Spec reference

See `docs/superpowers/specs/2026-04-20-landing-page-drafts-workflow-design.md` (committed as `fe3cfd9`).

## File structure

**New files:**

| Path | Responsibility |
|---|---|
| `app/Filament/Concerns/ManagesLandingPageDrafts.php` | Trait with `publishDraft`, `deleteDraft`, `regenerateAllSections`, `updateSectionField`, `deleteSection`, and the `guardDraftOwnership` helper. Extracted verbatim from `ManageLandingPageBatches`. |
| `app/Enums/LandingPageDraftStatus.php` | PHP backed enum with all seven status values (`queued`, `generating`, `ready`, `publishing`, `shortlisted`, `published`, `failed`, `archived`). |
| `app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php` | Drafts tab on Funnel edit page: table, row actions, filters, header Generate action. |
| `resources/views/filament/components/live-landing-card.blade.php` | Read-only card shown on optin FunnelStep pages summarizing the currently published draft. |
| `database/migrations/YYYY_MM_DD_HHMMSS_normalize_landing_page_draft_status.php` | Rewrites `pending` → `queued` for the pre-enum default rows. |
| `database/migrations/YYYY_MM_DD_HHMMSS_add_versions_per_template_to_landing_page_batches.php` | JSON column for per-template version counts in the Generate modal. |
| `tests/Feature/LandingPageDraftsRelationManagerTest.php` | Pest tests for RelationManager table, row actions, filters, generate modal. |
| `tests/Feature/Filament/EditFunnelStepDeleteDraftTest.php` | Regression test for the hotfix — proves `deleteDraft` no longer throws on `EditFunnelStep`. |

**Modified files:**

| Path | What changes |
|---|---|
| `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php` | Include the trait. |
| `app/Filament/Resources/FunnelSteps/Pages/ViewFunnelStep.php` | Replace inline methods with the trait. |
| `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php` | Replace inline methods with the trait (later deleted in Task 5). |
| `app/Models/LandingPageDraft.php` | Cast `status` to `LandingPageDraftStatus`. |
| `app/Models/Funnel.php` | Add `publishedDraft()` relation. |
| `app/Jobs/GenerateLandingPageVersionJob.php`, `GenerateLandingPageBatchJob.php` | Use enum cases instead of raw strings. |
| `app/Services/Templates/PublishDraftService.php` | Use enum cases. |
| `app/Filament/Resources/Funnels/FunnelResource.php` | Add `getRelations()`; remove retired page routes in Task 5. |
| `app/Filament/Resources/FunnelSteps/FunnelStepResource.php` | Rebuild `form()` into three Filament `Section`s in Task 6. |

**Deleted files (Task 5):**

- `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php`
- `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php`
- `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php`
- `resources/views/filament/components/landing-pages-list.blade.php`
- `resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php`

---

## Task 1: Hotfix — `ManagesLandingPageDrafts` trait unblocks the `EditFunnelStep` crash

**Files:**
- Create: `app/Filament/Concerns/ManagesLandingPageDrafts.php`
- Modify: `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php`
- Modify: `app/Filament/Resources/FunnelSteps/Pages/ViewFunnelStep.php`
- Modify: `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php`
- Create: `tests/Feature/Filament/EditFunnelStepDeleteDraftTest.php`

- [ ] **Step 1: Write the failing regression test**

Create `tests/Feature/Filament/EditFunnelStepDeleteDraftTest.php`:

```php
<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditFunnelStepDeleteDraftTest extends TestCase
{
    use RefreshDatabase;

    public function test_edit_funnel_step_page_can_delete_a_draft(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $step = FunnelStep::factory()->create([
            'funnel_id' => $funnel->id,
            'slug' => 'optin',
        ]);
        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'ready',
        ]);

        $page = new EditFunnelStep();
        $page->record = $step;

        $page->deleteDraft($draft->id);

        $this->assertNull(LandingPageDraft::find($draft->id));
    }
}
```

- [ ] **Step 2: Run the test — must fail with `MethodNotFoundException` or equivalent**

```
php artisan test --compact --filter=EditFunnelStepDeleteDraftTest
```

Expected: FAIL with "Call to undefined method ... deleteDraft()" or similar.

- [ ] **Step 3: Create the trait by lifting methods from `ManageLandingPageBatches`**

Create `app/Filament/Concerns/ManagesLandingPageDrafts.php`. Copy the `publishDraft`, `deleteDraft`, `regenerateAllSections`, `updateSectionField`, `deleteSection`, and `guardDraftOwnership` methods **verbatim** from `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php`. Preserve the import statements. The host page is expected to expose a `$record` property whose `id` resolves to either a `Funnel->id` or a `FunnelStep->funnel_id` — add an accessor to the trait so it works for both:

```php
<?php

namespace App\Filament\Concerns;

use App\Jobs\PublishLandingPageDraftJob;
use App\Jobs\RegenerateSectionJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

trait ManagesLandingPageDrafts
{
    // ---- the existing publishDraft / deleteDraft / regenerateAllSections /
    //      updateSectionField / deleteSection methods from
    //      ManageLandingPageBatches.php go here verbatim ----

    private function resolveFunnelId(): string
    {
        $record = $this->record;

        return match (true) {
            $record instanceof Funnel => (string) $record->id,
            $record instanceof FunnelStep => (string) $record->funnel_id,
            default => throw new \LogicException(
                'ManagesLandingPageDrafts: host page must bind a Funnel or FunnelStep to $record.'
            ),
        };
    }

    // replace every $this->record->id lookup inside the lifted methods
    // with $this->resolveFunnelId()
}
```

When copying the methods, search-and-replace `$this->record->id` with `$this->resolveFunnelId()` so the trait is agnostic about whether the host page binds a `Funnel` or a `FunnelStep`.

- [ ] **Step 4: Include the trait on all three consumer pages**

In `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php`, add the import and `use` inside the class:

```php
use App\Filament\Concerns\ManagesLandingPageDrafts;

class EditFunnelStep extends EditRecord
{
    use ManagesLandingPageDrafts;

    // ... existing code unchanged
}
```

In `app/Filament/Resources/FunnelSteps/Pages/ViewFunnelStep.php`:

1. Add the same `use App\Filament\Concerns\ManagesLandingPageDrafts;` import.
2. Add `use ManagesLandingPageDrafts;` inside the class.
3. **Delete** the existing `publishDraft` and `deleteDraft` methods (lines 48–68 of the current file) — the trait supersedes them with richer guards.

In `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php`:

1. Add the same import.
2. Add `use ManagesLandingPageDrafts;` inside the class.
3. **Delete** the inline `publishDraft`, `deleteDraft`, `regenerateAllSections`, `updateSectionField`, `deleteSection`, and `guardDraftOwnership` methods that now live in the trait.

- [ ] **Step 5: Run the hotfix test + the existing batch-editor test**

```
php artisan test --compact --filter="EditFunnelStepDeleteDraftTest|ManageLandingPageBatchesEditorTest"
```

Expected: all tests PASS. The existing `ManageLandingPageBatchesEditorTest` continues to pass because the trait exposes identical method signatures.

- [ ] **Step 6: Run Laravel Pint**

```
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 7: Commit**

```
git add \
  app/Filament/Concerns/ManagesLandingPageDrafts.php \
  app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php \
  app/Filament/Resources/FunnelSteps/Pages/ViewFunnelStep.php \
  app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php \
  tests/Feature/Filament/EditFunnelStepDeleteDraftTest.php

git commit -m "$(cat <<'EOF'
fix(filament): extract ManagesLandingPageDrafts trait

The drafts Blade partial is rendered on EditFunnelStep, ViewFunnelStep,
and ManageLandingPageBatches, but publishDraft/deleteDraft only lived on
the latter two pages. Clicking Delete from the Edit page triggered a
Livewire MethodNotFoundException. Lift the richer ManageLandingPageBatches
versions into a shared trait used by all three pages.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `LandingPageDraftStatus` enum + model cast + migration

**Files:**
- Create: `app/Enums/LandingPageDraftStatus.php`
- Modify: `app/Models/LandingPageDraft.php`
- Create: `database/migrations/YYYY_MM_DD_HHMMSS_normalize_landing_page_draft_status.php`
- Modify: `app/Jobs/GenerateLandingPageVersionJob.php`
- Modify: `app/Jobs/GenerateLandingPageBatchJob.php`
- Modify: `app/Services/Templates/PublishDraftService.php`
- Create: `tests/Unit/Enums/LandingPageDraftStatusTest.php`

- [ ] **Step 1: Write the enum test**

Create `tests/Unit/Enums/LandingPageDraftStatusTest.php`:

```php
<?php

namespace Tests\Unit\Enums;

use App\Enums\LandingPageDraftStatus;
use PHPUnit\Framework\TestCase;

class LandingPageDraftStatusTest extends TestCase
{
    public function test_has_all_known_statuses(): void
    {
        $values = array_map(fn ($c) => $c->value, LandingPageDraftStatus::cases());
        sort($values);

        $this->assertSame([
            'archived', 'failed', 'generating', 'published',
            'publishing', 'queued', 'ready', 'shortlisted',
        ], $values);
    }

    public function test_badge_color_mapping(): void
    {
        $this->assertSame('success', LandingPageDraftStatus::Published->badgeColor());
        $this->assertSame('info', LandingPageDraftStatus::Ready->badgeColor());
        $this->assertSame('info', LandingPageDraftStatus::Shortlisted->badgeColor());
        $this->assertSame('warning', LandingPageDraftStatus::Queued->badgeColor());
        $this->assertSame('warning', LandingPageDraftStatus::Generating->badgeColor());
        $this->assertSame('warning', LandingPageDraftStatus::Publishing->badgeColor());
        $this->assertSame('danger', LandingPageDraftStatus::Failed->badgeColor());
        $this->assertSame('gray', LandingPageDraftStatus::Archived->badgeColor());
    }

    public function test_is_publishable(): void
    {
        $this->assertTrue(LandingPageDraftStatus::Ready->isPublishable());
        $this->assertTrue(LandingPageDraftStatus::Shortlisted->isPublishable());
        $this->assertFalse(LandingPageDraftStatus::Queued->isPublishable());
        $this->assertFalse(LandingPageDraftStatus::Generating->isPublishable());
        $this->assertFalse(LandingPageDraftStatus::Publishing->isPublishable());
        $this->assertFalse(LandingPageDraftStatus::Published->isPublishable());
        $this->assertFalse(LandingPageDraftStatus::Failed->isPublishable());
        $this->assertFalse(LandingPageDraftStatus::Archived->isPublishable());
    }

    public function test_is_terminal_stops_deletion_guard(): void
    {
        $this->assertFalse(LandingPageDraftStatus::Generating->isDeletable());
        $this->assertFalse(LandingPageDraftStatus::Publishing->isDeletable());
        $this->assertTrue(LandingPageDraftStatus::Ready->isDeletable());
        $this->assertTrue(LandingPageDraftStatus::Failed->isDeletable());
        $this->assertTrue(LandingPageDraftStatus::Archived->isDeletable());
    }
}
```

- [ ] **Step 2: Run the enum test — must fail (enum doesn't exist)**

```
php artisan test --compact --filter=LandingPageDraftStatusTest
```

Expected: FAIL — "Class App\Enums\LandingPageDraftStatus not found".

- [ ] **Step 3: Create the enum**

Create `app/Enums/LandingPageDraftStatus.php`:

```php
<?php

namespace App\Enums;

enum LandingPageDraftStatus: string
{
    case Queued = 'queued';
    case Generating = 'generating';
    case Ready = 'ready';
    case Publishing = 'publishing';
    case Shortlisted = 'shortlisted';
    case Published = 'published';
    case Failed = 'failed';
    case Archived = 'archived';

    public function badgeColor(): string
    {
        return match ($this) {
            self::Published => 'success',
            self::Ready, self::Shortlisted => 'info',
            self::Queued, self::Generating, self::Publishing => 'warning',
            self::Failed => 'danger',
            self::Archived => 'gray',
        };
    }

    public function isPublishable(): bool
    {
        return match ($this) {
            self::Ready, self::Shortlisted => true,
            default => false,
        };
    }

    public function isDeletable(): bool
    {
        return ! in_array($this, [self::Generating, self::Publishing], true);
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
```

- [ ] **Step 4: Re-run the enum test — PASS**

```
php artisan test --compact --filter=LandingPageDraftStatusTest
```

- [ ] **Step 5: Create the migration**

```
php artisan make:migration normalize_landing_page_draft_status --no-interaction
```

Replace the generated body with:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migration 2026_04_17_100011 set the default to 'pending' but every
        // live code path writes 'queued'. Normalize rows created before the
        // enum landed so every LandingPageDraft.status fits LandingPageDraftStatus.
        DB::table('landing_page_drafts')
            ->where('status', 'pending')
            ->update(['status' => 'queued']);
    }

    public function down(): void
    {
        DB::table('landing_page_drafts')
            ->where('status', 'queued')
            ->update(['status' => 'pending']);
    }
};
```

- [ ] **Step 6: Cast status on the model**

Edit `app/Models/LandingPageDraft.php` `$casts` array. Add:

```php
'status' => \App\Enums\LandingPageDraftStatus::class,
```

- [ ] **Step 7: Migrate the dev database**

```
php artisan migrate
```

Expected: `2026_04_XX_XXXXXX_normalize_landing_page_draft_status ... DONE`.

- [ ] **Step 8: Replace raw status strings in jobs and services**

In `app/Jobs/GenerateLandingPageVersionJob.php`:

- Line 57: `'status' => 'generating'` → `'status' => \App\Enums\LandingPageDraftStatus::Generating`
- Line 94: `'status' => 'ready'` → `'status' => \App\Enums\LandingPageDraftStatus::Ready`
- Line 108: `'status' => 'failed'` → `'status' => \App\Enums\LandingPageDraftStatus::Failed`

In `app/Jobs/GenerateLandingPageBatchJob.php`:

- Line 28: `'status' => 'failed'` (on the **batch**, not draft — leave as string if the batch model has no enum yet).

In `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php` (still live until Task 5):

- Line 112: `'status' => 'queued'` → `'status' => \App\Enums\LandingPageDraftStatus::Queued`

In `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php` (still live until Task 5):

- Line 48: `'status' => 'shortlisted'` → `'status' => \App\Enums\LandingPageDraftStatus::Shortlisted`

In `app/Services/Templates/PublishDraftService.php`:

- Any raw `'published'` write → `\App\Enums\LandingPageDraftStatus::Published`
- Any raw `'archived'` write → `\App\Enums\LandingPageDraftStatus::Archived`

In `app/Filament/Concerns/ManagesLandingPageDrafts.php` (from Task 1):

- Replace any raw status strings with enum cases. In particular, `deleteDraft`'s `in_array($draft->status, ['generating','publishing'])` guard becomes `! $draft->status->isDeletable()`.

- [ ] **Step 9: Add a model enum-cast test to catch round-trip mistakes**

Append to `tests/Unit/Enums/LandingPageDraftStatusTest.php` — **no**, make a new feature test because it hits the DB. Create `tests/Feature/Models/LandingPageDraftStatusCastTest.php`:

```php
<?php

namespace Tests\Feature\Models;

use App\Enums\LandingPageDraftStatus;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Funnel;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageDraftStatusCastTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_reads_as_enum_and_writes_from_enum(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => LandingPageDraftStatus::Queued,
        ]);

        $this->assertInstanceOf(LandingPageDraftStatus::class, $draft->fresh()->status);
        $this->assertSame(LandingPageDraftStatus::Queued, $draft->fresh()->status);

        $draft->update(['status' => LandingPageDraftStatus::Ready]);
        $this->assertSame('ready', \DB::table('landing_page_drafts')->where('id', $draft->id)->value('status'));
    }
}
```

- [ ] **Step 10: Run the full test suite**

```
php artisan test --compact
```

Expected: all tests PASS. If a test that previously wrote a raw status string now fails, update it to use the enum.

- [ ] **Step 11: Run Pint and commit**

```
vendor/bin/pint --dirty --format agent

git add \
  app/Enums/LandingPageDraftStatus.php \
  app/Models/LandingPageDraft.php \
  app/Jobs/GenerateLandingPageVersionJob.php \
  app/Jobs/GenerateLandingPageBatchJob.php \
  app/Services/Templates/PublishDraftService.php \
  app/Filament/Concerns/ManagesLandingPageDrafts.php \
  app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php \
  app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php \
  database/migrations/*_normalize_landing_page_draft_status.php \
  tests/Unit/Enums/LandingPageDraftStatusTest.php \
  tests/Feature/Models/LandingPageDraftStatusCastTest.php

git commit -m "$(cat <<'EOF'
feat(models): LandingPageDraftStatus enum replaces raw strings

Consolidates the seven status values scattered across jobs, services, and
Filament pages into an enum with badgeColor(), isPublishable(), and
isDeletable() helpers. Migration normalizes the 'pending' default rows
from the original migration to 'queued' (the value live code writes).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `LandingPageDraftsRelationManager` on `FunnelResource`

**Files:**
- Create: `app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php`
- Modify: `app/Filament/Resources/Funnels/FunnelResource.php`
- Modify: `app/Models/Funnel.php` — add `drafts()` and `publishedDraft()` relations.
- Create: `tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php`

- [ ] **Step 1: Write a failing test that asserts the RelationManager shows drafts**

Create `tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php`:

```php
<?php

namespace Tests\Feature\Filament;

use App\Enums\LandingPageDraftStatus;
use App\Filament\Resources\Funnels\FunnelResource\Pages\EditFunnel;
use App\Filament\Resources\Funnels\RelationManagers\LandingPageDraftsRelationManager;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use function Pest\Livewire\livewire;

class LandingPageDraftsRelationManagerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_lists_drafts_belonging_to_the_funnel(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);

        $myBatch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
        ]);
        $otherBatch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $otherFunnel->id,
        ]);

        $mine = LandingPageDraft::factory()->create(['batch_id' => $myBatch->id]);
        $theirs = LandingPageDraft::factory()->create(['batch_id' => $otherBatch->id]);

        livewire(LandingPageDraftsRelationManager::class, [
            'ownerRecord' => $funnel,
            'pageClass' => EditFunnel::class,
        ])
            ->assertCanSeeTableRecords([$mine])
            ->assertCanNotSeeTableRecords([$theirs]);
    }
}
```

- [ ] **Step 2: Run the test — must fail (class doesn't exist)**

```
php artisan test --compact --filter=LandingPageDraftsRelationManagerTest::test_lists_drafts_belonging_to_the_funnel
```

Expected: FAIL — class not found.

- [ ] **Step 3: Add relations on the Funnel model**

Edit `app/Models/Funnel.php`. Add:

```php
use App\Enums\LandingPageDraftStatus;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

// ...

public function drafts(): HasManyThrough
{
    return $this->hasManyThrough(
        \App\Models\LandingPageDraft::class,
        \App\Models\LandingPageBatch::class,
        'funnel_id',   // foreign key on batches
        'batch_id',    // foreign key on drafts
        'id',          // local key on funnels
        'id',          // local key on batches
    );
}

public function publishedDraft()
{
    return $this->drafts()
        ->where('landing_page_drafts.status', LandingPageDraftStatus::Published->value)
        ->latest('landing_page_drafts.updated_at');
}
```

Model tests: verify the relation works. Add to `tests/Feature/Models/FunnelDraftsRelationTest.php`:

```php
<?php

namespace Tests\Feature\Models;

use App\Enums\LandingPageDraftStatus;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FunnelDraftsRelationTest extends TestCase
{
    use RefreshDatabase;

    public function test_drafts_relation_returns_drafts_through_batch(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $batch = LandingPageBatch::factory()->create(['funnel_id' => $funnel->id, 'summit_id' => $summit->id]);
        $draft = LandingPageDraft::factory()->create(['batch_id' => $batch->id]);

        $this->assertTrue($funnel->drafts->contains($draft));
    }

    public function test_published_draft_returns_most_recent_published(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $batch = LandingPageBatch::factory()->create(['funnel_id' => $funnel->id, 'summit_id' => $summit->id]);

        LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => LandingPageDraftStatus::Ready,
        ]);
        $older = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => LandingPageDraftStatus::Published,
            'updated_at' => now()->subDay(),
        ]);
        $newest = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => LandingPageDraftStatus::Published,
            'updated_at' => now(),
        ]);

        $this->assertTrue($funnel->publishedDraft()->first()->is($newest));
    }
}
```

- [ ] **Step 4: Create the RelationManager**

Create `app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php`:

```php
<?php

namespace App\Filament\Resources\Funnels\RelationManagers;

use App\Enums\LandingPageDraftStatus;
use App\Enums\SummitAudience;
use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Models\LandingPageDraft;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Contracts\Support\Htmlable;

class LandingPageDraftsRelationManager extends RelationManager
{
    use ManagesLandingPageDrafts;

    protected static string $relationship = 'drafts';

    protected static ?string $title = 'Drafts';

    public function isReadOnly(): bool
    {
        return false;
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('template_key')
                    ->label('Template')
                    ->formatStateUsing(function (string $state, LandingPageDraft $record) {
                        $registry = app(TemplateRegistry::class);
                        $label = $registry->get($state)['label'] ?? $state;
                        $palette = $record->palette ?? [];
                        $swatches = collect(array_slice(array_values($palette), 0, 5))
                            ->map(fn (string $hex) => "<span class='inline-block w-3 h-3 rounded-sm mr-0.5' style='background: {$hex}; border: 1px solid rgba(0,0,0,.08)'></span>")
                            ->implode('');

                        return "<div><div class='font-semibold text-gray-900'>".e($label)."</div><div class='font-mono text-xs text-gray-400'>".e($state)."</div><div class='mt-1 flex gap-px'>{$swatches}</div></div>";
                    })
                    ->html()
                    ->searchable(),

                TextColumn::make('version_number')
                    ->label('v')
                    ->formatStateUsing(fn (?int $state) => $state !== null ? "v{$state}" : '—')
                    ->sortable(),

                TextColumn::make('audience')
                    ->label('Audience')
                    ->badge()
                    ->formatStateUsing(fn (?SummitAudience $state) => $state?->label() ?? '—'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (LandingPageDraftStatus $state) => $state->badgeColor())
                    ->formatStateUsing(fn (LandingPageDraftStatus $state) => $state->label()),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options(collect(LandingPageDraftStatus::cases())
                        ->mapWithKeys(fn (LandingPageDraftStatus $s) => [$s->value => $s->label()])),
                SelectFilter::make('audience')
                    ->options(collect(SummitAudience::cases())
                        ->mapWithKeys(fn (SummitAudience $s) => [$s->value => $s->label()])),
                SelectFilter::make('template_key')
                    ->options(fn () => app(TemplateRegistry::class)
                        ->all()
                        ->mapWithKeys(fn (array $t) => [$t['key'] => $t['label'] ?? $t['key']])),
            ])
            ->headerActions([
                // Generate action added in Task 4
            ])
            ->recordActions([
                Action::make('view')
                    ->label('View')
                    ->url(fn (LandingPageDraft $record) =>
                        $record->preview_token
                            ? rtrim((string) config('next.url'), '/')."/preview/{$record->preview_token}"
                            : null)
                    ->openUrlInNewTab()
                    ->visible(fn (LandingPageDraft $record) => ! empty($record->preview_token)),

                Action::make('edit')
                    ->label('Edit')
                    ->url(fn (LandingPageDraft $record) =>
                        \App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage::getUrl([
                            'record' => $this->ownerRecord->getKey(),
                            'draft'  => $record->id,
                        ])),

                Action::make('publish')
                    ->label('Publish')
                    ->color('primary')
                    ->requiresConfirmation()
                    ->modalHeading('Publish this variant as the live landing page?')
                    ->modalSubmitActionLabel('Publish')
                    ->visible(fn (LandingPageDraft $record) => $record->status->isPublishable())
                    ->action(fn (LandingPageDraft $record) => $this->publishDraft($record->id)),

                DeleteAction::make()
                    ->label(fn () => '×')
                    ->modalHeading('Delete draft?')
                    ->hidden(fn (LandingPageDraft $record) => ! $record->status->isDeletable())
                    ->action(fn (LandingPageDraft $record) => $this->deleteDraft($record->id)),
            ])
            ->emptyStateHeading('No drafts yet')
            ->emptyStateDescription('Click Generate variants to kick off AI generation.');
    }
}
```

- [ ] **Step 5: Attach the RelationManager to `FunnelResource`**

Edit `app/Filament/Resources/Funnels/FunnelResource.php`. Add:

```php
public static function getRelations(): array
{
    return [
        \App\Filament\Resources\Funnels\RelationManagers\LandingPageDraftsRelationManager::class,
    ];
}
```

If `getRelations()` already exists, add the class to the returned array.

- [ ] **Step 6: Run the RelationManager test — PASS**

```
php artisan test --compact --filter="LandingPageDraftsRelationManagerTest|FunnelDraftsRelationTest"
```

Expected: both PASS.

- [ ] **Step 7: Add test coverage for row actions (publish and delete)**

Append to `tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php`:

```php
use Filament\Actions\Testing\TestAction;
use Illuminate\Support\Facades\Queue;
use App\Jobs\PublishLandingPageDraftJob;

public function test_publish_row_action_dispatches_job(): void
{
    Queue::fake();
    config(['features.runtime_gemini_gen' => true]);

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    \App\Models\FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'slug' => 'optin']);
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id, 'status' => 'running']);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => LandingPageDraftStatus::Ready,
        'sections' => [['id' => fake()->uuid(), 'type' => 'hero', 'status' => 'ready']],
    ]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->callTableAction(TestAction::make('publish')->table($draft));

    Queue::assertPushed(PublishLandingPageDraftJob::class);
}

public function test_delete_row_action_removes_draft(): void
{
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => LandingPageDraftStatus::Ready,
    ]);
    LandingPageDraft::factory()->create(['batch_id' => $batch->id, 'status' => LandingPageDraftStatus::Ready]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->callTableAction(TestAction::make('delete')->table($draft));

    $this->assertNull(LandingPageDraft::find($draft->id));
}

public function test_publish_action_hidden_when_status_not_publishable(): void
{
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => LandingPageDraftStatus::Generating,
    ]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->assertActionHidden(TestAction::make('publish')->table($draft));
}
```

- [ ] **Step 8: Run and commit**

```
php artisan test --compact --filter=LandingPageDraftsRelationManagerTest
vendor/bin/pint --dirty --format agent

git add \
  app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php \
  app/Filament/Resources/Funnels/FunnelResource.php \
  app/Models/Funnel.php \
  tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php \
  tests/Feature/Models/FunnelDraftsRelationTest.php

git commit -m "$(cat <<'EOF'
feat(filament): LandingPageDraftsRelationManager on Funnel

Adds a Drafts tab to the Funnel edit page with a Filament RelationManager
table (template label + palette strip, version, audience, status badge,
created-at), filters (status/audience/template), and row actions
(View/Edit/Publish/×-Delete). Publish and delete delegate to the
ManagesLandingPageDrafts trait. Generate action stub to be filled in next.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Generate variants action modal

**Files:**
- Modify: `app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php` — add `headerActions`
- Modify: `app/Models/LandingPageBatch.php` — add `versions_per_template` cast
- Create: `database/migrations/YYYY_MM_DD_HHMMSS_add_versions_per_template_to_landing_page_batches.php`
- Modify: `app/Jobs/GenerateLandingPageBatchJob.php` — honor per-template counts
- Append to: `tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php` — generate action test

- [ ] **Step 1: Write the failing test for the Generate action**

Append to `tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php`:

```php
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\LandingPageBatch as Batch;

public function test_generate_action_creates_batch_and_dispatches_job(): void
{
    Queue::fake();
    config(['features.runtime_gemini_gen' => true]);

    $summit = Summit::factory()->create(['audience' => \App\Enums\SummitAudience::AdhdParenting]);
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->callTableAction(TestAction::make('generate'), data: [
            'audience_override' => \App\Enums\SummitAudience::AdhdParenting->value,
            'template_selections' => [
                ['template_key' => 'opus-v1', 'count' => 2],
                ['template_key' => 'opus-broadsheet', 'count' => 1],
            ],
            'style_reference_url' => 'https://parenting-summits.com',
        ])
        ->assertNotified();

    $batch = Batch::where('funnel_id', $funnel->id)->first();
    $this->assertNotNull($batch);
    $this->assertSame(['opus-v1' => 2, 'opus-broadsheet' => 1], $batch->versions_per_template);
    Queue::assertPushed(GenerateLandingPageBatchJob::class);
}
```

- [ ] **Step 2: Run — must fail (Generate action not defined)**

```
php artisan test --compact --filter=test_generate_action_creates_batch_and_dispatches_job
```

- [ ] **Step 3: Migration — add `versions_per_template` JSON column on batches**

```
php artisan make:migration add_versions_per_template_to_landing_page_batches --no-interaction
```

Body:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->json('versions_per_template')->nullable()->after('template_pool');
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->dropColumn('versions_per_template');
        });
    }
};
```

Run:

```
php artisan migrate
```

- [ ] **Step 4: Cast on `LandingPageBatch`**

Edit `app/Models/LandingPageBatch.php` `$casts`:

```php
'versions_per_template' => 'array',
```

And add to `$fillable`:

```php
'versions_per_template',
```

- [ ] **Step 5: Update `GenerateLandingPageBatchJob` to honor per-template counts**

Edit `app/Jobs/GenerateLandingPageBatchJob.php`. Inside `handle()`, where the job currently iterates `template_pool × version_count`, switch to `versions_per_template` when present:

```php
$counts = $batch->versions_per_template ?? [];

if (empty($counts)) {
    // Legacy fallback — flat template_pool × version_count
    $selected = app(\App\Services\Templates\TemplateSelector::class)
        ->pick($batch->template_pool, $batch->version_count);
    $counts = array_count_values($selected);
}

foreach ($counts as $templateKey => $n) {
    for ($i = 0; $i < $n; $i++) {
        $draft = \App\Models\LandingPageDraft::firstOrCreate(
            // same key used by existing retry logic; leave untouched
            ['batch_id' => $batch->id, 'template_key' => $templateKey, 'version_number' => $i + 1],
            ['status' => \App\Enums\LandingPageDraftStatus::Queued, 'audience' => $batch->audience],
        );

        \App\Jobs\GenerateLandingPageVersionJob::dispatch($draft->id);
    }
}
```

**Do not change the existing firstOrCreate keys** (per the `fix(jobs): firstOrCreate draft so 429 retries don't trip unique constraint` commit `b6a480d`). If the existing job already uses these keys, just add the `versions_per_template` branch at the top and leave the rest.

- [ ] **Step 6: Add the `generate` header action to the RelationManager**

In `LandingPageDraftsRelationManager::table()`, replace the empty `headerActions([])` with:

```php
->headerActions([
    Action::make('generate')
        ->label('Generate variants')
        ->icon('heroicon-o-sparkles')
        ->color('primary')
        ->modalWidth('2xl')
        ->schema([
            \Filament\Forms\Components\Select::make('audience_override')
                ->label('Audience')
                ->options(collect(SummitAudience::cases())
                    ->mapWithKeys(fn (SummitAudience $s) => [$s->value => $s->label()]))
                ->default(fn () => $this->ownerRecord->summit->audience?->value)
                ->required()
                ->helperText('Determines copy tone and resolved palette tokens.'),

            \Filament\Forms\Components\Repeater::make('template_selections')
                ->label('Templates')
                ->helperText('Pick the templates to generate from, and how many variants each.')
                ->minItems(1)
                ->defaultItems(1)
                ->schema([
                    \Filament\Forms\Components\Select::make('template_key')
                        ->label('Template')
                        ->options(fn () => app(TemplateRegistry::class)
                            ->all()
                            ->mapWithKeys(fn (array $t) => [$t['key'] => $t['label'] ?? $t['key']]))
                        ->required()
                        ->searchable(),

                    \Filament\Forms\Components\TextInput::make('count')
                        ->label('Variants')
                        ->numeric()
                        ->integer()
                        ->minValue(1)
                        ->maxValue(5)
                        ->default(1)
                        ->required(),
                ])
                ->columns(2),

            \Filament\Forms\Components\TextInput::make('style_reference_url')
                ->label('Style reference URL')
                ->url()
                ->helperText('Optional. AI will mirror its typography, spacing, and layout rhythm.'),
        ])
        ->action(function (array $data) {
            $countsMap = collect($data['template_selections'])
                ->mapWithKeys(fn (array $row) => [$row['template_key'] => (int) $row['count']])
                ->toArray();

            $batch = \App\Models\LandingPageBatch::create([
                'summit_id' => $this->ownerRecord->summit_id,
                'funnel_id' => $this->ownerRecord->id,
                'status'    => 'running',
                'audience'  => $data['audience_override'],
                'template_pool'         => array_keys($countsMap),
                'versions_per_template' => $countsMap,
                'version_count'         => array_sum($countsMap),
                'style_reference_url'   => $data['style_reference_url'] ?? null,
            ]);

            \App\Jobs\GenerateLandingPageBatchJob::dispatch($batch->id);

            \Filament\Notifications\Notification::make()
                ->title('Generation started')
                ->body('Generating '.array_sum($countsMap).' variants across '.count($countsMap).' templates.')
                ->success()
                ->send();
        }),
]),
```

- [ ] **Step 7: Run the generate-action test — PASS**

```
php artisan test --compact --filter=test_generate_action_creates_batch_and_dispatches_job
```

- [ ] **Step 8: Commit**

```
vendor/bin/pint --dirty --format agent

git add \
  app/Filament/Resources/Funnels/RelationManagers/LandingPageDraftsRelationManager.php \
  app/Models/LandingPageBatch.php \
  app/Jobs/GenerateLandingPageBatchJob.php \
  database/migrations/*_add_versions_per_template_to_landing_page_batches.php \
  tests/Feature/Filament/LandingPageDraftsRelationManagerTest.php

git commit -m "$(cat <<'EOF'
feat(filament): Generate variants header action on Drafts tab

Replaces the separate GenerateLandingPagesPage with a modal form reachable
from the Drafts RelationManager. Adds versions_per_template JSON on
landing_page_batches so operators can request e.g. 2 'Editorial Minimal'
+ 1 'Broadsheet' in a single submission. Job falls back to the legacy
template_pool behaviour when versions_per_template is null.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Retire legacy draft pages

**Files:**
- Delete: `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php`
- Delete: `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php`
- Delete: `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php`
- Delete: `resources/views/filament/components/landing-pages-list.blade.php`
- Delete: `resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php`
- Modify: `app/Filament/Resources/Funnels/FunnelResource.php` — remove the page routes.
- Modify: `tests/Feature/ManageLandingPageBatchesEditorTest.php` — repoint to the trait host.

- [ ] **Step 1: Repoint the existing editor test to the trait**

The current `tests/Feature/ManageLandingPageBatchesEditorTest.php` newed up `ManageLandingPageBatches` — that class is about to go away. Replace it with a fixture class that uses the trait, because the trait is what actually implements the behavior going forward. Edit the test file:

```php
// tests/Feature/ManagesLandingPageDraftsTraitTest.php (rename)
namespace Tests\Feature;

use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Models\Funnel;
// ... other imports ...

class ManagesLandingPageDraftsTraitTest extends TestCase
{
    use RefreshDatabase;

    private function makePage(Funnel $funnel): object
    {
        return new class($funnel) {
            use ManagesLandingPageDrafts;

            public function __construct(public Funnel $record) {}
        };
    }

    // Keep all existing test method bodies verbatim.
}
```

Then:

```
git mv tests/Feature/ManageLandingPageBatchesEditorTest.php tests/Feature/ManagesLandingPageDraftsTraitTest.php
```

Update the class name and top-of-file imports inside the renamed file.

- [ ] **Step 2: Run the renamed test — PASS (behavior unchanged, only host moved)**

```
php artisan test --compact --filter=ManagesLandingPageDraftsTraitTest
```

- [ ] **Step 3: Delete the retired pages and partials**

```
rm \
  app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php \
  app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php \
  app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php \
  resources/views/filament/components/landing-pages-list.blade.php \
  resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php
```

- [ ] **Step 4: Remove route registrations from `FunnelResource`**

Edit `app/Filament/Resources/Funnels/FunnelResource.php`. In `getPages()`, remove any entries that reference the three deleted classes. Keep:

- `'index'`, `'create'`, `'edit'`, `'view'` — standard CRUD routes.
- The `EditLandingPageDraftPage` route — kept because it's still how drafts are edited.

Search the file for `GenerateLandingPagesPage`, `LandingPageDraftsPage`, `ManageLandingPageBatches` and remove every reference.

- [ ] **Step 5: Run the full suite — nothing else should break**

```
php artisan test --compact
```

If any test references the deleted classes directly, remove or repoint it. Common suspects: tests asserting route existence.

- [ ] **Step 6: Boot the admin locally and click through**

```
composer dev
```

Manually:

1. Visit `/admin/<domain>/funnels/<id>/edit` → verify the Drafts tab appears with drafts.
2. Click "Generate variants" → modal opens, submit works.
3. Confirm the old `/admin/<domain>/funnels/<id>/generate-landing-pages` URL returns 404.
4. Confirm `EditLandingPageDraftPage` still opens when clicking Edit on a draft row.

- [ ] **Step 7: Commit**

```
vendor/bin/pint --dirty --format agent

git add -A

git commit -m "$(cat <<'EOF'
refactor(filament): retire legacy drafts pages

Deletes GenerateLandingPagesPage, LandingPageDraftsPage,
ManageLandingPageBatches, and their Blade views. The DraftsRelationManager
and the Generate modal from the previous commits replace every capability
they offered. EditLandingPageDraftPage stays — it is still the per-draft
content editor.

Renames ManageLandingPageBatchesEditorTest to
ManagesLandingPageDraftsTraitTest and repoints it at the trait via an
anonymous host class.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `FunnelStep` page redesign — Live landing card + collapsible Builder

**Files:**
- Create: `resources/views/filament/components/live-landing-card.blade.php`
- Modify: `app/Filament/Resources/FunnelSteps/FunnelStepResource.php` — rebuild `form()` into three Sections.
- Modify: `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php` and `ViewFunnelStep.php` — stop rendering the deleted partial.
- Create: `tests/Feature/Filament/FunnelStepLiveLandingCardTest.php`

- [ ] **Step 1: Write the failing test — card appears for optin step with published draft**

Create `tests/Feature/Filament/FunnelStepLiveLandingCardTest.php`:

```php
<?php

namespace Tests\Feature\Filament;

use App\Enums\LandingPageDraftStatus;
use App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use function Pest\Livewire\livewire;

class FunnelStepLiveLandingCardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_optin_step_with_published_draft_shows_card_content(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $step = FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'slug' => 'optin']);
        $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
        LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => LandingPageDraftStatus::Published,
            'template_key' => 'opus-v1',
            'version_number' => 3,
            'palette' => ['#0f172a', '#f8f1e7', '#d97706', '#475569', '#fef3c7'],
        ]);

        livewire(EditFunnelStep::class, ['record' => $step->id])
            ->assertSeeHtml('opus-v1')
            ->assertSeeHtml('v3')
            ->assertSeeHtml('#d97706');
    }

    public function test_non_optin_step_does_not_show_live_landing_card(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $upsellStep = FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'slug' => 'upsell', 'step_type' => 'upsell']);

        livewire(EditFunnelStep::class, ['record' => $upsellStep->id])
            ->assertDontSee('Live landing page');
    }

    public function test_optin_step_without_published_draft_shows_empty_state(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $step = FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'slug' => 'optin']);

        livewire(EditFunnelStep::class, ['record' => $step->id])
            ->assertSee('No live landing page yet');
    }
}
```

- [ ] **Step 2: Run — must fail**

```
php artisan test --compact --filter=FunnelStepLiveLandingCardTest
```

- [ ] **Step 3: Create the Blade partial**

Create `resources/views/filament/components/live-landing-card.blade.php`:

```blade
@php
    /** @var \App\Models\FunnelStep $step */
    $step = $getRecord();
    $funnel = $step->funnel;
    $draft = $funnel?->publishedDraft()->first();
    $previewBase = rtrim((string) config('next.url'), '/');
    $registry = app(\App\Services\Templates\TemplateRegistry::class);
@endphp

@if ($draft)
    @php
        $label = $registry->get($draft->template_key)['label'] ?? $draft->template_key;
        $palette = $draft->palette ?? [];
        $previewUrl = $draft->preview_token ? "{$previewBase}/preview/{$draft->preview_token}" : null;
        $draftsTabUrl = \App\Filament\Resources\Funnels\FunnelResource::getUrl('edit', ['record' => $funnel->id]).'?tab=drafts';
    @endphp

    <div class="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 flex items-center justify-between gap-5 dark:from-purple-500/5 dark:to-transparent dark:border-purple-500/20">
        <div class="flex items-center gap-4 min-w-0">
            <div class="w-[140px] h-[88px] rounded-lg bg-gradient-to-br from-slate-900 to-slate-600 shrink-0 shadow-sm"></div>
            <div class="flex flex-col gap-1.5 min-w-0">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                    <span>Published {{ $draft->updated_at->diffForHumans() }}</span>
                </div>
                <div class="text-lg font-bold text-slate-900 dark:text-white truncate">{{ $label }} · v{{ $draft->version_number }}</div>
                <div class="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span>audience: {{ $draft->audience?->label() ?? '—' }}</span>
                    <span class="text-slate-300">·</span>
                    <span>palette:</span>
                    <span class="inline-flex gap-0.5">
                        @foreach (array_slice(array_values($palette), 0, 5) as $swatch)
                            <span class="w-3.5 h-3.5 rounded-sm ring-1 ring-black/5" style="background: {{ $swatch }}"></span>
                        @endforeach
                    </span>
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-2 shrink-0">
            @if ($previewUrl)
                <a href="{{ $previewUrl }}" target="_blank" rel="noopener"
                   class="fi-btn fi-btn-size-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 text-center hover:bg-slate-50">Preview</a>
            @endif
            <a href="{{ $draftsTabUrl }}"
               class="fi-btn fi-btn-size-sm rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white text-center hover:bg-purple-700">Go to Drafts</a>
        </div>
    </div>
@else
    @php
        $draftsTabUrl = \App\Filament\Resources\Funnels\FunnelResource::getUrl('edit', ['record' => $funnel?->id]).'?tab=drafts';
    @endphp
    <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:bg-white/5 dark:border-white/10">
        <h4 class="text-base font-semibold text-slate-900 dark:text-white">No live landing page yet</h4>
        <p class="mt-1 text-sm text-slate-500">Publish a draft from the Drafts tab to go live.</p>
        @if ($funnel)
            <a href="{{ $draftsTabUrl }}"
               class="mt-4 inline-block fi-btn fi-btn-size-sm rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">Go to Drafts</a>
        @endif
    </div>
@endif
```

- [ ] **Step 4: Rebuild `FunnelStepResource::form()` into three Sections**

Edit `app/Filament/Resources/FunnelSteps/FunnelStepResource.php`. Replace the current `form()` body with:

```php
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Forms\Components\ViewField;
use Filament\Forms\Components\Grid;

public static function form(\Filament\Forms\Form $form): \Filament\Forms\Form
{
    return $form
        ->schema([
            Section::make('Live landing page')
                ->description('What visitors see right now')
                ->visible(fn (Get $get) => $get('step_type') === 'optin')
                ->schema([
                    ViewField::make('live_landing_card')
                        ->view('filament.components.live-landing-card'),
                ]),

            Section::make('Step details')
                ->description('Identity, type, and product link')
                ->columns(3)
                ->schema([
                    \Filament\Forms\Components\TextInput::make('name')->required()->columnSpan(1),
                    \Filament\Forms\Components\TextInput::make('slug')->required()->columnSpan(1),
                    \Filament\Forms\Components\TextInput::make('sort_order')->numeric()->default(0)->columnSpan(1),
                    \Filament\Forms\Components\Select::make('step_type')
                        ->options(['optin' => 'Optin', 'upsell' => 'Upsell', 'thankyou' => 'Thank-you', 'checkout' => 'Checkout'])
                        ->required()
                        ->live()
                        ->columnSpan(1),
                    \Filament\Forms\Components\Select::make('product_id')
                        ->relationship('product', 'name')
                        ->searchable()
                        ->columnSpan(1),
                    \Filament\Forms\Components\Toggle::make('is_published')->columnSpan(1),
                ]),

            Section::make('Page content blocks')
                ->description(fn (Get $get) => is_array($get('page_content')) ? count($get('page_content')).' blocks' : 'empty')
                ->collapsed()
                ->schema([
                    // Leave the existing Builder definition for page_content here.
                    // Copy it verbatim from the current FunnelStepResource::form() body.
                ]),
        ]);
}
```

**Important:** the "Page content blocks" section must contain the existing `Builder` definition. Copy it from the pre-change `form()` method verbatim — do not reinvent block schemas.

- [ ] **Step 5: Delete the old drafts-list embed**

Grep for `landing-pages-list` in the codebase:

```
grep -r "landing-pages-list" app resources
```

Remove every occurrence of `@include('filament.components.landing-pages-list', ...)` or any Filament `ViewField` that loads that view. The partial was deleted in Task 5 — references to it would 500.

- [ ] **Step 6: Run the Step-page test — PASS**

```
php artisan test --compact --filter=FunnelStepLiveLandingCardTest
```

- [ ] **Step 7: Run the full suite**

```
php artisan test --compact
```

- [ ] **Step 8: Smoke test locally**

```
composer dev
```

Manually:
1. Edit an optin step of a funnel with a published draft → "Live landing page" card appears at the top; palette shows correct swatches; Preview + Go to Drafts links work.
2. Edit an optin step of a funnel **without** a published draft → empty state appears with "Go to Drafts" button.
3. Edit an upsell or thankyou step → no "Live landing page" section at all; "Step details" is the first section.
4. Expand "Page content blocks" → existing Builder still works; add/remove a block and save.

- [ ] **Step 9: Commit**

```
vendor/bin/pint --dirty --format agent

git add \
  resources/views/filament/components/live-landing-card.blade.php \
  app/Filament/Resources/FunnelSteps/FunnelStepResource.php \
  tests/Feature/Filament/FunnelStepLiveLandingCardTest.php

git commit -m "$(cat <<'EOF'
feat(filament): FunnelStep page Live landing card + sections

Replaces the embedded drafts list on Step pages with a read-only
Live landing page card (template label, version, audience, palette,
publish timestamp, Preview + Go to Drafts actions). Section is shown
only on optin steps — other step types skip it and jump to Step details.
Page content Builder is preserved but demoted into a collapsed section.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final verification

After all six commits land:

```
php artisan test --compact
vendor/bin/pint --dirty --format agent
composer dev
```

Walk the acceptance path end-to-end:

1. Navigate to `/admin/althea-academy/funnels/<id>/edit` → **Drafts** tab visible with count.
2. Open Drafts tab → table shows drafts with template label, palette strip, audience badge, status badge, created-at.
3. Filter by Status = Failed → only failed rows.
4. Click "Generate variants" → modal opens, select two templates with different counts, submit → new batch created, drafts appear with Status = Queued → Generating → Ready as job runs.
5. Click "Publish" on a Ready draft → confirmation modal → Publish → draft status = Published; previous Published drafts in same funnel flipped to Archived.
6. Click "Edit" on a draft row → `EditLandingPageDraftPage` loads.
7. Click "×" on a draft row → confirmation modal → deletion; batch deleted when last draft removed.
8. Navigate to the optin FunnelStep → "Live landing page" card shows the correct template, version, palette, timestamp.
9. Navigate to an upsell FunnelStep → no "Live landing page" section.
10. Expand "Page content blocks" section → Builder still edits live content.

## Self-review notes

- **Spec coverage:** Tasks 1–6 match the spec's commit list 1:1. Hotfix (Task 1) ships first and is independently mergeable. Enum consolidation (Task 2), RelationManager (Task 3), Generate modal (Task 4), retirement (Task 5), Step page redesign (Task 6). All spec sections are represented.
- **Placeholders:** Migration filenames use `YYYY_MM_DD_HHMMSS` because `artisan make:migration` stamps those. That is not a placeholder for the engineer to fill in.
- **Type consistency:** `LandingPageDraftStatus` enum cases used identically across Task 2 definition and Tasks 3/4/6 references. `publishDraft`, `deleteDraft` signatures preserved from the existing trait source (`ManageLandingPageBatches`) throughout.
- **Guardrails:** Task 5's test-file rename keeps the entire `ManagesLandingPageDraftsTraitTest` suite green — no behavior loss, just host relocation.
