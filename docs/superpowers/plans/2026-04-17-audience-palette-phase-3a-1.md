# Audience Palette — Phase 3a-1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the audience palette pipeline end-to-end and make opus-v1 render correct palettes per summit audience. After this plan, any summit with an assigned audience generates landing pages where opus-v1's CTAs, backgrounds, and accents pick up the audience palette.

**Architecture:** `SummitAudience` enum + `AudiencePalettes` hardcoded map (8 audiences × 8 CSS-custom-property tokens). Summit has a nullable `audience` field. Each batch can override. Job resolves at generate time, stores the 8 hex values on the draft. API returns the palette alongside `sections`/`enabled_sections`. Next.js applies as inline `style={{ '--primary': ..., ... }}` on the OpusV1 layout root. opus-v1's CSS is rewritten to read only from the universal 8-token vocabulary.

**Scope:** opus-v1 only. opus-v5 port happens in Phase 3a-2 (separate plan). Other templates (opus-v2/v3/v4, variants, adhd-summit) stay on hardcoded colors and ignore the palette — they continue to render correctly, just audience-blind.

**Tech Stack:** Laravel 13 · PHP 8.3 · Filament v4 · Pest 4 · PostgreSQL JSONB · Next.js 16.2 · React 19.2 · Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-04-17-audience-palette-design.md` (commit `539a5bd`).

---

## Prerequisites

- Phase 2a landed on branch `experiment/framer-variants-2026-04-17` (last Phase 2a commit `7f7d9bc` plus factory cleanup `26a0a7c`).
- `php artisan migrate` runs clean.
- `cd next-app && pnpm test --run` green (273 tests).

---

## File map

### New files (Laravel)

| Path | Responsibility |
|---|---|
| `app/Enums/SummitAudience.php` | PHP-native enum with 8 audiences |
| `app/Services/Templates/AudiencePalettes.php` | `PALETTES` const map + `NEUTRAL` + `paletteFor()` |
| `app/Services/Templates/AudienceResolver.php` | `resolveForBatch(LandingPageBatch): array` |
| `database/migrations/2026_04_17_180000_add_audience_fields_to_summits_batches_drafts.php` | summit.audience + batch.audience_override + draft.audience + draft.palette |
| `tests/Unit/Services/Templates/AudiencePalettesTest.php` | palette integrity (every audience has all 8 tokens, valid hex) |
| `tests/Unit/Services/Templates/AudienceResolverTest.php` | resolver logic |

### Modified files (Laravel)

| Path | What changes |
|---|---|
| `app/Models/Summit.php` | `audience` in `$fillable`; `SummitAudience` enum cast |
| `app/Models/LandingPageBatch.php` | `audience_override` in `$fillable`; enum cast |
| `app/Models/LandingPageDraft.php` | `audience` + `palette` in `$fillable`; `palette` array cast |
| `app/Filament/Resources/Summits/SummitResource.php` | Audience Select on the summit form |
| `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php` | `audience_override` Select on generate form |
| `app/Jobs/GenerateLandingPageVersionJob.php` | Resolve palette; store on draft |
| `app/Services/Templates/PublishDraftService.php` | Snapshot `audience` + `palette` into `page_content` |
| `app/Http/Controllers/Api/LandingPageDraftController.php` | Return `palette` in JSON response |
| `app/Http/Controllers/Api/PublicFunnelController.php` | Return `palette` in JSON response |
| `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php` | Assert palette stored on draft |
| `tests/Feature/Services/PublishDraftServiceTest.php` | Assert palette in page_content snapshot |

### New files (Next.js)

| Path | Responsibility |
|---|---|
| `next-app/src/lib/palette.ts` | `Palette` type; `applyPalette()` helper returning React.CSSProperties |

### Modified files (Next.js)

| Path | What changes |
|---|---|
| `next-app/src/lib/api/laravel.ts` | `DraftPayload.palette` + `PublicPayload.palette` type additions |
| `next-app/src/templates/OpusV1.tsx` | Accept `palette` prop; pass to layout |
| `next-app/src/templates/opus-v1/layout.tsx` | Apply palette as CSS vars on root |
| `next-app/src/templates/opus-v1.styles.css` | Rewrite color selectors to use universal tokens |
| `next-app/src/app/globals.css` | Tailwind theme color aliases point at universal tokens (so opus-v1's Tailwind utilities pick them up) |
| `next-app/src/app/preview/[token]/page.tsx` | Thread `palette` prop to OpusV1 (legacy templates unchanged) |
| `next-app/src/app/f/[funnel]/optin/page.tsx` | Thread `palette` prop to OpusV1 |

---

## Task order

```
T1  SummitAudience enum
T2  AudiencePalettes (8 palettes + neutral + tests)
T3  AudienceResolver (+ tests)
T4  DB migration + model casts + model test
T5  Filament: SummitResource audience picker
T6  Filament: GenerateLandingPagesPage audience_override picker
T7  Job stores audience + palette on draft
T8  PublishDraftService snapshots palette
T9  API controllers return palette
T10 Next.js: palette type + helper + DraftPayload/PublicPayload shape
T11 Next.js: opus-v1 CSS token migration (the core rewrite)
T12 Next.js: OpusV1Layout applies palette CSS vars + route wiring
T13 Smoke test + cleanup
```

T1 → T4 are sequential foundation. T5–T9 can't start until T4. T10 can start in parallel once T9 is committed. T11+T12+T13 are Next.js tail.

One commit per task.

---

## Task T1: `SummitAudience` enum

**Files:**
- Create: `app/Enums/SummitAudience.php`

- [ ] **Step 1: Create the enum**

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum SummitAudience: string
{
    case AdhdParenting   = 'adhd-parenting';
    case AdhdWomen       = 'adhd-women';
    case AdhdMen         = 'adhd-men';
    case AdhdGeneral     = 'adhd-general';
    case Ai              = 'ai';
    case Menopause       = 'menopause';
    case Herbal          = 'herbal';
    case WomenLongevity  = 'women-longevity';

    public function label(): string
    {
        return match ($this) {
            self::AdhdParenting   => 'ADHD — Parenting',
            self::AdhdWomen       => 'ADHD — Women',
            self::AdhdMen         => 'ADHD — Men',
            self::AdhdGeneral     => 'ADHD — General',
            self::Ai              => 'AI',
            self::Menopause       => 'Menopause',
            self::Herbal          => 'Herbal',
            self::WomenLongevity  => 'Women Longevity',
        };
    }

    /** @return array<string, string> value → label for Filament Select options */
    public static function options(): array
    {
        $out = [];
        foreach (self::cases() as $c) {
            $out[$c->value] = $c->label();
        }
        return $out;
    }
}
```

- [ ] **Step 2: Commit**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
git add app/Enums/SummitAudience.php
git commit -m "feat(audiences): SummitAudience enum with 8 starter audiences"
```

---

## Task T2: `AudiencePalettes` + 8 starter palettes + tests

**Files:**
- Create: `app/Services/Templates/AudiencePalettes.php`
- Create: `tests/Unit/Services/Templates/AudiencePalettesTest.php`

- [ ] **Step 1: Write the test first (TDD)**

Create `tests/Unit/Services/Templates/AudiencePalettesTest.php`:

```php
<?php

declare(strict_types=1);

use App\Enums\SummitAudience;
use App\Services\Templates\AudiencePalettes;

it('has a palette for every audience', function () {
    foreach (SummitAudience::cases() as $audience) {
        $palette = AudiencePalettes::paletteFor($audience);
        expect($palette)->toBeArray();
        expect(count($palette))->toBe(8);
    }
});

it('every palette carries the 8 universal tokens', function () {
    $expectedKeys = ['primary', 'primary-contrast', 'ink', 'paper', 'paper-alt', 'muted', 'accent', 'border'];

    foreach (SummitAudience::cases() as $audience) {
        $palette = AudiencePalettes::paletteFor($audience);
        foreach ($expectedKeys as $key) {
            expect($palette)->toHaveKey($key);
        }
    }
});

it('every palette value is a valid 7-char hex', function () {
    foreach (SummitAudience::cases() as $audience) {
        $palette = AudiencePalettes::paletteFor($audience);
        foreach ($palette as $token => $hex) {
            expect($hex)->toBeString();
            expect(strlen($hex))->toBe(7, "{$audience->value}.{$token} must be 7 chars; got '{$hex}'");
            expect($hex[0])->toBe('#');
            expect(preg_match('/^#[0-9a-fA-F]{6}$/', $hex))->toBe(1);
        }
    }
});

it('NEUTRAL palette carries all 8 tokens', function () {
    $expectedKeys = ['primary', 'primary-contrast', 'ink', 'paper', 'paper-alt', 'muted', 'accent', 'border'];
    foreach ($expectedKeys as $key) {
        expect(AudiencePalettes::NEUTRAL)->toHaveKey($key);
    }
});

it('paletteFor returns NEUTRAL when given null', function () {
    expect(AudiencePalettes::paletteFor(null))->toBe(AudiencePalettes::NEUTRAL);
});
```

- [ ] **Step 2: Run tests — expect failure**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
./vendor/bin/pest tests/Unit/Services/Templates/AudiencePalettesTest.php --compact
```

Expect: all 5 fail with "class not found".

- [ ] **Step 3: Implement `AudiencePalettes`**

Create `app/Services/Templates/AudiencePalettes.php`:

```php
<?php

declare(strict_types=1);

namespace App\Services\Templates;

use App\Enums\SummitAudience;

class AudiencePalettes
{
    /**
     * Neutral fallback — matches opus-v1's current warm editorial look.
     * Used when a summit has no audience assigned.
     */
    public const NEUTRAL = [
        'primary'          => '#C9812A',   // ochre
        'primary-contrast' => '#F5F1EA',   // paper-50
        'ink'              => '#2A0F17',   // ink-900
        'paper'            => '#F5F1EA',   // paper-50
        'paper-alt'        => '#EDE7DD',   // paper-100
        'muted'            => '#6B5B4E',   // taupe-600
        'accent'           => '#D9963F',   // ochre-400
        'border'           => '#DDD2C3',   // paper-300
    ];

    /**
     * @var array<string, array<string, string>> keyed by SummitAudience::value
     */
    public const PALETTES = [
        'adhd-parenting' => [
            'primary'          => '#8B5CF6',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#1A1625',
            'paper'            => '#FAF7FF',
            'paper-alt'        => '#F3EDFF',
            'muted'            => '#6B5B8A',
            'accent'           => '#C4B5FD',
            'border'           => '#E0D4FF',
        ],
        'adhd-women' => [
            'primary'          => '#B1344A',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#18161A',
            'paper'            => '#FAF8F4',
            'paper-alt'        => '#F5F1EA',
            'muted'            => '#6B5B55',
            'accent'           => '#E8A4B3',
            'border'           => '#E8DDD2',
        ],
        'adhd-men' => [
            'primary'          => '#1E3A8A',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#14120F',
            'paper'            => '#ECE7DB',
            'paper-alt'        => '#D9D1BD',
            'muted'            => '#A69A82',
            'accent'           => '#3B82F6',
            'border'           => '#38332B',
        ],
        'adhd-general' => [
            'primary'          => '#2563EB',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#0F172A',
            'paper'            => '#F5F1EA',
            'paper-alt'        => '#E8E2D5',
            'muted'            => '#64748B',
            'accent'           => '#60A5FA',
            'border'           => '#D4CDB8',
        ],
        'ai' => [
            'primary'          => '#0A0A0A',
            'primary-contrast' => '#F2EFE9',
            'ink'              => '#0A0A0A',
            'paper'            => '#F2EFE9',
            'paper-alt'        => '#E5E1D7',
            'muted'            => '#737373',
            'accent'           => '#F2C14B',
            'border'           => '#D4CFC2',
        ],
        'menopause' => [
            'primary'          => '#D9436A',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#2A1622',
            'paper'            => '#FBF0F3',
            'paper-alt'        => '#F5E0E8',
            'muted'            => '#8A6570',
            'accent'           => '#F8B4C3',
            'border'           => '#EAC9D4',
        ],
        'herbal' => [
            'primary'          => '#6B8E5A',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#1F2817',
            'paper'            => '#F5F1E8',
            'paper-alt'        => '#EAE4D3',
            'muted'            => '#6B7A5A',
            'accent'           => '#A4C48A',
            'border'           => '#D4CDB8',
        ],
        'women-longevity' => [
            'primary'          => '#5E8E72',
            'primary-contrast' => '#FFFFFF',
            'ink'              => '#1F2923',
            'paper'            => '#F4EFE4',
            'paper-alt'        => '#E7E0CF',
            'muted'            => '#6F7A6E',
            'accent'           => '#A4C6B1',
            'border'           => '#D4CDB8',
        ],
    ];

    /**
     * Returns the resolved palette hex map for the given audience.
     * Null returns NEUTRAL.
     *
     * @return array<string, string>
     */
    public static function paletteFor(?SummitAudience $audience): array
    {
        if ($audience === null) {
            return self::NEUTRAL;
        }

        return self::PALETTES[$audience->value] ?? self::NEUTRAL;
    }
}
```

- [ ] **Step 4: Run tests — expect pass**

```
./vendor/bin/pest tests/Unit/Services/Templates/AudiencePalettesTest.php --compact
```

Expect: all 5 pass.

- [ ] **Step 5: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add app/Services/Templates/AudiencePalettes.php tests/Unit/Services/Templates/AudiencePalettesTest.php
git commit -m "feat(audiences): AudiencePalettes map + 8 starter palettes + NEUTRAL fallback"
```

---

## Task T3: `AudienceResolver` + tests

**Files:**
- Create: `app/Services/Templates/AudienceResolver.php`
- Create: `tests/Unit/Services/Templates/AudienceResolverTest.php`

Note: this task writes tests that reference `LandingPageBatch::factory()` + `Summit::factory()`. The factories are already present (factories were added in commit `26a0a7c`). The `audience`/`audience_override` columns don't exist yet (T4 adds them), so these tests must stub at the property level rather than relying on DB attributes. Read below — tests use in-memory objects, not DB persistence.

- [ ] **Step 1: Write failing tests**

Create `tests/Unit/Services/Templates/AudienceResolverTest.php`:

```php
<?php

declare(strict_types=1);

use App\Enums\SummitAudience;
use App\Models\{LandingPageBatch, Summit};
use App\Services\Templates\{AudiencePalettes, AudienceResolver};

it('uses batch audience_override when present', function () {
    $summit = new Summit();
    $summit->audience = SummitAudience::Herbal;

    $batch = new LandingPageBatch();
    $batch->audience_override = SummitAudience::AdhdWomen;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver();
    $palette = $resolver->resolveForBatch($batch);

    expect($palette)->toBe(AudiencePalettes::PALETTES['adhd-women']);
});

it('falls back to summit audience when batch has no override', function () {
    $summit = new Summit();
    $summit->audience = SummitAudience::Herbal;

    $batch = new LandingPageBatch();
    $batch->audience_override = null;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver();
    $palette = $resolver->resolveForBatch($batch);

    expect($palette)->toBe(AudiencePalettes::PALETTES['herbal']);
});

it('falls back to NEUTRAL when neither batch nor summit has audience', function () {
    $summit = new Summit();
    $summit->audience = null;

    $batch = new LandingPageBatch();
    $batch->audience_override = null;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver();
    $palette = $resolver->resolveForBatch($batch);

    expect($palette)->toBe(AudiencePalettes::NEUTRAL);
});

it('resolveEnum returns the enum that applies to the batch (or null)', function () {
    $summit = new Summit();
    $summit->audience = SummitAudience::Menopause;

    $batch = new LandingPageBatch();
    $batch->audience_override = SummitAudience::Ai;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver();
    expect($resolver->resolveEnum($batch))->toBe(SummitAudience::Ai);

    $batch->audience_override = null;
    expect($resolver->resolveEnum($batch))->toBe(SummitAudience::Menopause);

    $summit->audience = null;
    expect($resolver->resolveEnum($batch))->toBeNull();
});
```

- [ ] **Step 2: Run — expect fail**

```
./vendor/bin/pest tests/Unit/Services/Templates/AudienceResolverTest.php --compact
```

Expect: all 4 fail with "class not found" + missing enum cast on models. The enum casts land in T4; for T3 we accept that tests reference `$summit->audience = SummitAudience::...` directly, and the resolver reads that property. As long as the property access doesn't go through Eloquent casting for this test (in-memory model), PHP stores the enum instance as-is.

- [ ] **Step 3: Implement the resolver**

Create `app/Services/Templates/AudienceResolver.php`:

```php
<?php

declare(strict_types=1);

namespace App\Services\Templates;

use App\Enums\SummitAudience;
use App\Models\LandingPageBatch;

class AudienceResolver
{
    /**
     * @return array<string, string> 8-token palette hex map
     */
    public function resolveForBatch(LandingPageBatch $batch): array
    {
        return AudiencePalettes::paletteFor($this->resolveEnum($batch));
    }

    public function resolveEnum(LandingPageBatch $batch): ?SummitAudience
    {
        if ($batch->audience_override instanceof SummitAudience) {
            return $batch->audience_override;
        }

        $summit = $batch->summit;
        if ($summit && $summit->audience instanceof SummitAudience) {
            return $summit->audience;
        }

        return null;
    }
}
```

- [ ] **Step 4: Run — expect pass**

```
./vendor/bin/pest tests/Unit/Services/Templates/AudienceResolverTest.php --compact
```

Expect: 4 pass.

- [ ] **Step 5: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add app/Services/Templates/AudienceResolver.php tests/Unit/Services/Templates/AudienceResolverTest.php
git commit -m "feat(audiences): AudienceResolver with batch-override/summit/NEUTRAL cascade"
```

---

## Task T4: DB migration + model casts

**Files:**
- Create: `database/migrations/2026_04_17_180000_add_audience_fields_to_summits_batches_drafts.php`
- Modify: `app/Models/Summit.php`
- Modify: `app/Models/LandingPageBatch.php`
- Modify: `app/Models/LandingPageDraft.php`
- Create: `tests/Feature/Models/AudienceCastsTest.php`

- [ ] **Step 1: Create the migration**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
php artisan make:migration add_audience_fields_to_summits_batches_drafts --no-interaction
```

If the generated timestamp collides with another migration, rename the file to `2026_04_17_180000_add_audience_fields_to_summits_batches_drafts.php` (check `ls database/migrations/` for the latest stamp and choose a later one if needed).

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
        Schema::table('summits', function (Blueprint $table) {
            $table->string('audience')->nullable()->after('slug');
        });

        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->string('audience_override')->nullable()->after('completed_at');
        });

        Schema::table('landing_page_drafts', function (Blueprint $table) {
            $table->string('audience')->nullable()->after('enabled_sections');
            $table->json('palette')->nullable()->after('audience');
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table) {
            $table->dropColumn(['audience', 'palette']);
        });

        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->dropColumn('audience_override');
        });

        Schema::table('summits', function (Blueprint $table) {
            $table->dropColumn('audience');
        });
    }
};
```

- [ ] **Step 2: Update `Summit` model**

In `app/Models/Summit.php`:

Add `'audience'` to `$fillable`. Add to casts:

```php
'audience' => \App\Enums\SummitAudience::class,
```

- [ ] **Step 3: Update `LandingPageBatch` model**

Add `'audience_override'` to `$fillable`. Add to casts:

```php
'audience_override' => \App\Enums\SummitAudience::class,
```

- [ ] **Step 4: Update `LandingPageDraft` model**

Add `'audience'` and `'palette'` to `$fillable`. Add to casts:

```php
'audience' => \App\Enums\SummitAudience::class,
'palette' => 'array',
```

- [ ] **Step 5: Run migration**

```
php artisan migrate
```

Expect: migration runs clean.

Verify columns exist:

```
php artisan tinker --execute='echo json_encode(\Schema::getColumnListing("summits"));'
php artisan tinker --execute='echo json_encode(\Schema::getColumnListing("landing_page_batches"));'
php artisan tinker --execute='echo json_encode(\Schema::getColumnListing("landing_page_drafts"));'
```

Look for `audience`, `audience_override`, `audience`, `palette` respectively.

- [ ] **Step 6: Write the cast test**

Create `tests/Feature/Models/AudienceCastsTest.php`:

```php
<?php

declare(strict_types=1);

use App\Enums\SummitAudience;
use App\Models\{Funnel, LandingPageBatch, LandingPageDraft, Summit};

it('casts Summit.audience to SummitAudience enum', function () {
    $summit = Summit::factory()->create(['audience' => SummitAudience::Herbal]);
    expect($summit->fresh()->audience)->toBe(SummitAudience::Herbal);
});

it('allows null Summit.audience', function () {
    $summit = Summit::factory()->create(['audience' => null]);
    expect($summit->fresh()->audience)->toBeNull();
});

it('casts LandingPageBatch.audience_override to SummitAudience enum', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::factory()->create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'audience_override' => SummitAudience::Ai,
    ]);
    expect($batch->fresh()->audience_override)->toBe(SummitAudience::Ai);
});

it('casts LandingPageDraft.palette to array', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'palette' => ['primary' => '#000000', 'ink' => '#111111'],
    ]);
    $fresh = $draft->fresh();
    expect($fresh->palette)->toBeArray();
    expect($fresh->palette['primary'])->toBe('#000000');
});
```

- [ ] **Step 7: Run tests**

```
php -d memory_limit=512M vendor/bin/pest tests/Feature/Models/AudienceCastsTest.php --compact
```

Expect: 4 pass.

- [ ] **Step 8: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add database/migrations/2026_04_17_180000_add_audience_fields_to_summits_batches_drafts.php \
        app/Models/Summit.php \
        app/Models/LandingPageBatch.php \
        app/Models/LandingPageDraft.php \
        tests/Feature/Models/AudienceCastsTest.php
git commit -m "feat(db): audience + palette fields on summits, batches, drafts"
```

---

## Task T5: Filament SummitResource audience picker

**Files:**
- Modify: `app/Filament/Resources/Summits/SummitResource.php`

- [ ] **Step 1: Read current form schema**

```
cat app/Filament/Resources/Summits/SummitResource.php
```

Find the `form(Schema $schema): Schema` method (or `forms()` method, whichever Filament v4 convention the file uses). Understand the component order — the audience picker should sit near the summit identity fields (title, slug).

- [ ] **Step 2: Add Select component**

Import at top:

```php
use App\Enums\SummitAudience;
use Filament\Forms\Components\Select;
```

Inside the components array (after the slug input; check the sibling file structure for style), add:

```php
Select::make('audience')
    ->label('Audience')
    ->options(SummitAudience::options())
    ->nullable()
    ->placeholder('— neutral / none —')
    ->helperText('Controls the palette colors applied to every generated landing page.'),
```

If the file uses sections/groups, nest appropriately — match the file's existing pattern.

- [ ] **Step 3: Manual smoke**

Start the app: `composer dev` (user runs this; just confirm it starts). Navigate to `/admin/<tenant>/summits/create` — audience picker should appear. Pick a value, save, edit — value persists.

- [ ] **Step 4: Write Filament test**

Append to `tests/Feature/Filament/SummitResourceTest.php` (create if absent):

```php
<?php

use App\Enums\SummitAudience;
use App\Filament\Resources\Summits\SummitResource;
use App\Models\{Domain, Summit, User};
use Filament\Facades\Filament;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->domain = Domain::factory()->create(['slug' => 'test-domain']);
    Filament::setTenant($this->domain);
});

it('creates a summit with an audience', function () {
    livewire(SummitResource\Pages\CreateSummit::class)
        ->fillForm([
            'title' => 'ADHD Women Summit 2026',
            'slug' => 'adhd-women-2026',
            'audience' => SummitAudience::AdhdWomen->value,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $summit = Summit::firstWhere('slug', 'adhd-women-2026');
    expect($summit->audience)->toBe(SummitAudience::AdhdWomen);
});

it('allows creating a summit without an audience', function () {
    livewire(SummitResource\Pages\CreateSummit::class)
        ->fillForm([
            'title' => 'Neutral Summit 2026',
            'slug' => 'neutral-2026',
            'audience' => null,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $summit = Summit::firstWhere('slug', 'neutral-2026');
    expect($summit->audience)->toBeNull();
});
```

If the `CreateSummit::class` path differs, adjust imports — look at `app/Filament/Resources/Summits/Pages/`.

Adjust the `fillForm` payload to include any other required summit fields (description, dates, host fields) by looking at the summit factory and Filament form.

- [ ] **Step 5: Run tests**

```
php -d memory_limit=512M vendor/bin/pest tests/Feature/Filament/SummitResourceTest.php --compact
```

Expect: 2 pass.

- [ ] **Step 6: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add app/Filament/Resources/Summits/SummitResource.php tests/Feature/Filament/SummitResourceTest.php
git commit -m "feat(filament): audience picker on summit form"
```

---

## Task T6: Filament generate form audience override

**Files:**
- Modify: `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php`

- [ ] **Step 1: Read current form**

```
cat app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php
```

Find the form builder; locate where existing fields like template pool and variant count are declared.

- [ ] **Step 2: Add the override select**

Imports:

```php
use App\Enums\SummitAudience;
use Filament\Forms\Components\Select;
```

Inside the form components, after the template pool (before variant count or wherever makes logical sense):

```php
Select::make('audience_override')
    ->label('Audience override (optional)')
    ->options(SummitAudience::options())
    ->nullable()
    ->placeholder('Use summit default')
    ->helperText('Override the summit\'s audience just for this batch.'),
```

- [ ] **Step 3: Pass the override through to the batch**

In the action/submit method that creates the `LandingPageBatch`, include `audience_override` in the creation payload. Example:

```php
$batch = LandingPageBatch::create([
    // ... existing fields
    'audience_override' => $data['audience_override'] ?? null,
]);
```

The enum cast on the model will handle conversion from string to enum.

- [ ] **Step 4: Add feature test**

Append to `tests/Feature/Filament/GenerateLandingPagesPageTest.php` (or extend the existing form test). Skip if running this test family is broken by parallel-session work — note as a concern and continue.

```php
it('persists audience_override to the batch', function () {
    $funnel = Funnel::factory()->for($this->summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin']);

    livewire(GenerateLandingPagesPage::class, [
        'tenant' => $this->domain->slug,
        'record' => $funnel->id,
    ])
        ->fillForm([
            'template_pool' => ['opus-v1'],
            'version_count' => 1,
            'audience_override' => SummitAudience::Menopause->value,
        ])
        ->call('submit')  // or whatever the action name is — verify in the page class
        ->assertHasNoFormErrors();

    $batch = LandingPageBatch::where('funnel_id', $funnel->id)->latest()->first();
    expect($batch)->not->toBeNull();
    expect($batch->audience_override)->toBe(SummitAudience::Menopause);
});
```

Adjust the form payload for any other required fields.

- [ ] **Step 5: Run**

```
php -d memory_limit=512M vendor/bin/pest tests/Feature/Filament/GenerateLandingPagesPageTest.php --compact
```

Expect: existing tests + 1 new all pass (or note pre-existing failures unrelated to this task).

- [ ] **Step 6: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php tests/Feature/Filament/GenerateLandingPagesPageTest.php
git commit -m "feat(filament): audience_override picker on generate-landing-pages form"
```

---

## Task T7: Job stores audience + palette on draft

**Files:**
- Modify: `app/Jobs/GenerateLandingPageVersionJob.php`
- Modify: `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`

- [ ] **Step 1: Add the resolver call**

In `app/Jobs/GenerateLandingPageVersionJob.php`, inside `handle()`, after the batch is loaded and before the draft update:

```php
$resolver = app(\App\Services\Templates\AudienceResolver::class);
$audienceEnum = $resolver->resolveEnum($batch);
$palette = $resolver->resolveForBatch($batch);
```

In the `$draft->update([...])` payload, add:

```php
'audience' => $audienceEnum,
'palette' => $palette,
```

(The enum cast on the model will convert `$audienceEnum` — a `SummitAudience` or null — to string in the DB.)

- [ ] **Step 2: Add test — adhd-women summit gets correct palette**

Append to `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`:

```php
it('stores audience and palette on the draft when summit has audience', function () {
    $summit = Summit::factory()->create(['audience' => \App\Enums\SummitAudience::AdhdWomen]);
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(\App\Services\Templates\TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
            'generation_ms' => 1000,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft)->not->toBeNull();
    expect($draft->audience)->toBe(\App\Enums\SummitAudience::AdhdWomen);
    expect($draft->palette)->toBe(\App\Services\Templates\AudiencePalettes::PALETTES['adhd-women']);
});

it('batch override wins over summit default', function () {
    $summit = Summit::factory()->create(['audience' => \App\Enums\SummitAudience::Herbal]);
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
        'audience_override' => \App\Enums\SummitAudience::Ai,
    ]);

    $this->mock(\App\Services\Templates\TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
            'generation_ms' => 1000,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->audience)->toBe(\App\Enums\SummitAudience::Ai);
    expect($draft->palette)->toBe(\App\Services\Templates\AudiencePalettes::PALETTES['ai']);
});

it('stores NEUTRAL palette when summit has no audience', function () {
    $summit = Summit::factory()->create(['audience' => null]);
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(\App\Services\Templates\TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
            'generation_ms' => 1000,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->audience)->toBeNull();
    expect($draft->palette)->toBe(\App\Services\Templates\AudiencePalettes::NEUTRAL);
});
```

- [ ] **Step 3: Run**

```
php -d memory_limit=512M vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php --compact
```

Expect: 3 new + 4 pre-existing = 7 pass.

- [ ] **Step 4: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add app/Jobs/GenerateLandingPageVersionJob.php tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php
git commit -m "feat(jobs): resolve audience + store palette on draft at generate time"
```

---

## Task T8: PublishDraftService snapshots palette

**Files:**
- Modify: `app/Services/Templates/PublishDraftService.php`
- Modify: `tests/Feature/Services/PublishDraftServiceTest.php`

- [ ] **Step 1: Add palette + audience to snapshot payload**

In `PublishDraftService.php`, find the place where `page_content` is assembled for the snapshot (T10 of Phase 2a added `enabled_sections`; same spot). Extend:

```php
$step->update([
    'page_content' => [
        'template_key' => $draft->template_key,
        'content' => $draft->sections,
        'enabled_sections' => $draft->enabled_sections,
        'audience' => $draft->audience?->value,
        'palette' => $draft->palette,
    ],
]);
```

`$draft->audience?->value` serialises the enum to string for storage (JSON column stores the string).

- [ ] **Step 2: Extend tests**

In `tests/Feature/Services/PublishDraftServiceTest.php`, find the existing test that asserts `page_content` shape after publish. Extend the expected payload to include `audience` and `palette`. Example diff pattern:

```php
expect($step->fresh()->page_content)->toBe([
    'template_key' => 'opus-v1',
    'content' => /* whatever content */,
    'enabled_sections' => ['hero', 'footer'],
    'audience' => 'adhd-women',
    'palette' => \App\Services\Templates\AudiencePalettes::PALETTES['adhd-women'],
]);
```

If the test uses `toMatchArray` / `toHaveKey` rather than exact equality, add `expect($step->fresh()->page_content)->toHaveKey('palette')`.

Add a new test for a legacy draft (no audience):

```php
it('snapshots null audience + NEUTRAL palette when draft has no audience', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin']);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['hero' => ['headline' => 'X']],
        'enabled_sections' => ['hero', 'footer'],
        'audience' => null,
        'palette' => null,
        'status' => 'ready',
        'preview_token' => 'tok',
    ]);

    app(PublishDraftService::class)->publish($draft, User::factory()->create());

    $page = $step->fresh()->page_content;
    expect($page['audience'])->toBeNull();
    expect($page['palette'])->toBeNull();
});
```

- [ ] **Step 3: Run**

```
php -d memory_limit=512M vendor/bin/pest tests/Feature/Services/PublishDraftServiceTest.php --compact
```

Expect: all pass.

- [ ] **Step 4: Pint + commit**

```
./vendor/bin/pint --dirty --format agent
git add app/Services/Templates/PublishDraftService.php tests/Feature/Services/PublishDraftServiceTest.php
git commit -m "feat(publish): snapshot audience + palette into funnel_step.page_content"
```

---

## Task T9: API controllers return palette

**Files:**
- Modify: `app/Http/Controllers/Api/LandingPageDraftController.php`
- Modify: `app/Http/Controllers/Api/PublicFunnelController.php`

- [ ] **Step 1: Add palette to draft JSON**

Open `app/Http/Controllers/Api/LandingPageDraftController.php`. In the `show`/`preview` method, the response array built from the draft model already returns `sections` and `enabled_sections` (per T10 of Phase 2a). Extend:

```php
return response()->json([
    // ... existing keys
    'audience' => $draft->audience?->value,
    'palette' => $draft->palette,  // already array via model cast
]);
```

- [ ] **Step 2: Add palette to public funnel JSON**

Open `app/Http/Controllers/Api/PublicFunnelController.php`. The optin endpoint reads `step.page_content`. Extend the output:

```php
return response()->json([
    // ... existing keys
    'audience' => $step->page_content['audience'] ?? null,
    'palette' => $step->page_content['palette'] ?? null,
]);
```

- [ ] **Step 3: Quick smoke**

Spin up PHP server: `php artisan serve` (user runs). Generate a draft, hit the draft endpoint, confirm `palette` appears. Skippable if manual smoke isn't convenient.

- [ ] **Step 4: Commit (no new tests; controller tests would duplicate model tests at this layer)**

```
./vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/Api/LandingPageDraftController.php app/Http/Controllers/Api/PublicFunnelController.php
git commit -m "feat(api): expose audience + palette in draft and public funnel JSON"
```

---

## Task T10: Next.js palette types + helper

**Files:**
- Create: `next-app/src/lib/palette.ts`
- Modify: `next-app/src/lib/api/laravel.ts`

- [ ] **Step 1: Create the palette type + helper**

```ts
// next-app/src/lib/palette.ts
import type { CSSProperties } from 'react';

export type Palette = {
  primary: string;
  'primary-contrast': string;
  ink: string;
  paper: string;
  'paper-alt': string;
  muted: string;
  accent: string;
  border: string;
};

/**
 * Produce inline CSS custom properties for a palette.
 * Returns undefined if palette is null so React omits the style attr.
 */
export function paletteStyle(palette: Palette | null | undefined): CSSProperties | undefined {
  if (!palette) return undefined;
  return {
    '--primary': palette.primary,
    '--primary-contrast': palette['primary-contrast'],
    '--ink': palette.ink,
    '--paper': palette.paper,
    '--paper-alt': palette['paper-alt'],
    '--muted': palette.muted,
    '--accent': palette.accent,
    '--border': palette.border,
  } as CSSProperties;
}
```

- [ ] **Step 2: Extend Laravel API types**

In `next-app/src/lib/api/laravel.ts`, find `DraftPayload` and `PublicPayload` type definitions (T10 of Phase 2a added `enabled_sections`). Add:

```ts
audience: string | null;
palette: Palette | null;
```

Import `Palette`:

```ts
import type { Palette } from '../palette';
```

- [ ] **Step 3: Add tiny test**

```ts
// next-app/src/lib/palette.test.ts
import { describe, it, expect } from 'vitest';
import { paletteStyle, type Palette } from './palette';

describe('paletteStyle', () => {
  it('returns CSS vars for a full palette', () => {
    const p: Palette = {
      primary: '#111', 'primary-contrast': '#fff',
      ink: '#000', paper: '#eee', 'paper-alt': '#ddd',
      muted: '#aaa', accent: '#f55', border: '#ccc',
    };
    const style = paletteStyle(p) as Record<string, string>;
    expect(style['--primary']).toBe('#111');
    expect(style['--paper-alt']).toBe('#ddd');
    expect(style['--accent']).toBe('#f55');
  });

  it('returns undefined for null', () => {
    expect(paletteStyle(null)).toBeUndefined();
    expect(paletteStyle(undefined)).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform/next-app
pnpm test src/lib/palette.test.ts --run
pnpm typecheck 2>&1 | grep -v "HeroWithCountdown\|playwright" | head
```

Expect: 2 tests pass. Typecheck clean aside from pre-existing errors.

- [ ] **Step 5: Commit**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
git add next-app/src/lib/palette.ts next-app/src/lib/palette.test.ts next-app/src/lib/api/laravel.ts
git commit -m "feat(next): Palette type + paletteStyle helper + extend API payload types"
```

---

## Task T11: opus-v1 CSS token migration

This is the core of Phase 3a-1 — rewriting opus-v1's styling so it reads from universal CSS custom properties instead of hardcoded colors. After this task, opus-v1 changes appearance based on which palette is injected at the root.

**Files:**
- Modify: `next-app/src/templates/opus-v1.styles.css`
- Modify: `next-app/src/app/globals.css`
- Modify: `next-app/src/templates/opus-v1/skins/*.tsx` (only skins that use hardcoded Tailwind color utilities — audit during implementation)

### Background

opus-v1 uses two color systems simultaneously:
1. **CSS custom properties** defined in `opus-v1.styles.css` and `globals.css` (`--color-opus-v1-paper-50`, etc.). These we rewrite.
2. **Tailwind utility classes** like `bg-paper-100`, `text-ink-700`, `bg-ochre-600`. These are backed by the Tailwind v4 theme — the theme values need to read from the same universal custom properties.

After this task, the opus-v1 template root has a style block setting universal tokens (`--primary`, `--paper`, etc.), and all colors flow from there.

### Strategy

- **Tailwind theme aliases:** map the existing named colors (`paper-50`, `ink-700`, `ochre-600`) to CSS custom properties via Tailwind v4's `@theme` block. Existing utility classes in JSX continue to work; their output color now comes from the universal palette.
- **Direct custom-property usage:** anywhere the CSS file uses `var(--color-opus-v1-XYZ)`, rewrite to `var(--primary)` / `var(--paper)` / etc.
- **Portrait gradient constants in skins:** the `PORTRAIT_GRADIENTS`, `AVATAR_GRADIENTS`, `FOUNDER_GRADIENTS`, `TESTIMONIAL_GRADIENTS` in `skins/shared.ts` are decorative placeholders (speaker portrait backgrounds). Keep them hardcoded for Phase 3a — they don't encode brand identity; they're visual noise. Document this decision with a comment.

- [ ] **Step 1: Audit opus-v1.styles.css**

```
cat /Users/tajbrzovic/wcc-projects/summit-platform/next-app/src/templates/opus-v1.styles.css
```

Identify every `var(--color-opus-v1-...)` reference. Map each to the universal token:

- `--color-opus-v1-paper-50` → `--paper`
- `--color-opus-v1-paper-100` → `--paper-alt`
- `--color-opus-v1-paper-300` → `--border`
- `--color-opus-v1-ink-700` → `--ink`
- `--color-opus-v1-ink-900` → `--ink` (collapse to same token; ink-900 was near-black)
- `--color-opus-v1-ochre-600` → `--primary`
- `--color-opus-v1-ochre-400` → `--accent`
- `--color-opus-v1-taupe-600` → `--muted`
- `--color-opus-v1-taupe-700` → `--muted` (collapse)

If additional opus-v1 tokens exist, add the mapping. Any token that doesn't fit the 8-universal set should be kept as a template-local literal (keep it hardcoded in the CSS file). Rationale: we don't want to break contrast by forcing a match.

- [ ] **Step 2: Rewrite opus-v1.styles.css**

Replace opus-v1 custom-property references per the mapping. Also ensure the file defines safe fallbacks at `:root .opus-v1-root` so the template still renders when palette is absent:

```css
.opus-v1-root {
  /* Fallback palette — matches NEUTRAL in app/Services/Templates/AudiencePalettes.php */
  --primary: #C9812A;
  --primary-contrast: #F5F1EA;
  --ink: #2A0F17;
  --paper: #F5F1EA;
  --paper-alt: #EDE7DD;
  --muted: #6B5B4E;
  --accent: #D9963F;
  --border: #DDD2C3;

  background: var(--paper);
  color: var(--ink);
}

/* All existing selectors continue here; replace opus-v1-specific custom props with universals. */
```

When the React layout inlines `style={{ '--primary': '#B1344A', ... }}` on `.opus-v1-root`, the inline style overrides the fallback. This gives us the desired "CSS fallback when palette is null" behavior.

- [ ] **Step 3: Update globals.css for Tailwind theme**

Open `next-app/src/app/globals.css`. Find the `@theme` block for opus-v1's color scale. Rewrite to use universals:

```css
@theme {
  --color-paper-50: var(--paper);
  --color-paper-100: var(--paper-alt);
  --color-paper-300: var(--border);
  --color-ink-700: var(--ink);
  --color-ink-900: var(--ink);
  --color-ochre-400: var(--accent);
  --color-ochre-500: var(--accent);
  --color-ochre-600: var(--primary);
  --color-ochre-700: var(--primary);
  --color-taupe-600: var(--muted);
  --color-taupe-700: var(--muted);
  /* Add any remaining mappings */
}
```

Keep token names that are used as Tailwind utility classes in opus-v1 skin JSX. If a skin uses `bg-paper-50` (check with grep), the theme must define `--color-paper-50`.

Verify: `grep -rn "bg-paper-\|text-ink-\|bg-ochre-\|text-taupe-" next-app/src/templates/opus-v1/` — ensure every color class has a mapping.

- [ ] **Step 4: Keep portrait gradients hardcoded**

In `next-app/src/templates/opus-v1/skins/shared.ts`, add a comment above the gradient constants explaining why they're not palette-driven:

```ts
// Portrait placeholder gradients are decorative (speaker avatar backgrounds before
// real images load). They intentionally do NOT follow the audience palette — this
// avoids jarring color shifts when palette changes mid-page render and keeps
// portrait backgrounds visually consistent with their "neutral earth tones" role.
export const PORTRAIT_GRADIENTS = [ /* ... */ ];
```

- [ ] **Step 5: Build + visual check**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform/next-app
pnpm build
```

Expect: clean build. Typecheck may still flag pre-existing HeroWithCountdown / playwright errors — ignore.

For visual: skip in auto mode; checked during T13 smoke.

- [ ] **Step 6: Run existing opus-v1 tests**

```
pnpm test src/templates/opus-v1/ src/templates/opus-v1.schema.test.ts --run
```

Expect: all green (CSS changes don't affect schema tests or layout render smoke).

- [ ] **Step 7: Commit**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
git add next-app/src/templates/opus-v1.styles.css next-app/src/app/globals.css next-app/src/templates/opus-v1/skins/shared.ts
git commit -m "refactor(opus-v1): CSS reads universal 8-token palette vocabulary"
```

---

## Task T12: OpusV1 layout applies palette + route wiring

**Files:**
- Modify: `next-app/src/templates/OpusV1.tsx`
- Modify: `next-app/src/templates/opus-v1/layout.tsx`
- Modify: `next-app/src/app/preview/[token]/page.tsx`
- Modify: `next-app/src/app/f/[funnel]/optin/page.tsx`

- [ ] **Step 1: Update OpusV1Layout to accept + apply palette**

In `next-app/src/templates/opus-v1/layout.tsx`:

Add to imports:

```tsx
import { paletteStyle, type Palette } from '@/lib/palette';
```

Extend props:

```tsx
export type OpusV1LayoutProps = {
  content: OpusV1Content;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
};
```

Apply in JSX:

```tsx
export function OpusV1Layout({
  content,
  enabledSections,
  speakers,
  funnelId,
  palette,
}: OpusV1LayoutProps) {
  // ... existing logic ...

  return (
    <div className="opus-v1-root opus-v1-body antialiased" style={paletteStyle(palette)}>
      ...
    </div>
  );
}
```

- [ ] **Step 2: Update OpusV1 thin wrapper**

`next-app/src/templates/OpusV1.tsx`:

```tsx
import type { Speaker } from './types';
import type { OpusV1Content } from './opus-v1.schema';
import type { Palette } from '@/lib/palette';
import { OpusV1Layout } from './opus-v1/layout';

type Props = {
  content: OpusV1Content;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
};

export function OpusV1({ content, speakers, funnelId, enabledSections, palette }: Props) {
  return (
    <OpusV1Layout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
      palette={palette}
    />
  );
}
```

- [ ] **Step 3: Thread `palette` in preview route**

Open `next-app/src/app/preview/[token]/page.tsx`. Find where `<OpusV1 .../>` is rendered. Add `palette={draft.palette}`:

```tsx
<OpusV1
  content={draft.sections}
  enabledSections={draft.enabled_sections ?? undefined}
  speakers={speakers}
  funnelId={funnelId}
  palette={draft.palette}
/>
```

Other templates in the switch (opus-v2 through adhd-summit) stay unchanged — they don't accept `palette` yet. TypeScript should be happy because the other template components don't have `palette` in their prop types. If TypeScript complains about the conditional branch, wrap the opus-v1 case in a type assertion similar to what Phase 2a's enabled_sections branch does.

- [ ] **Step 4: Thread `palette` in public optin route**

Same pattern in `next-app/src/app/f/[funnel]/optin/page.tsx`. The payload here comes from `PublicPayload`; `palette` is now on the type.

- [ ] **Step 5: Add layout test for palette application**

Append to `next-app/src/templates/opus-v1/layout.test.tsx`:

```tsx
it('applies palette as inline CSS custom properties on root', () => {
  const palette = {
    primary: '#B1344A',
    'primary-contrast': '#FFFFFF',
    ink: '#18161A',
    paper: '#FAF8F4',
    'paper-alt': '#F5F1EA',
    muted: '#6B5B55',
    accent: '#E8A4B3',
    border: '#E8DDD2',
  } as const;

  const html = renderToStaticMarkup(
    <OpusV1Layout
      content={fixture.content}
      speakers={fixture.speakers}
      funnelId="funnel-1"
      palette={palette}
    />,
  );

  // CSS vars serialize into the style attribute
  expect(html).toContain('--primary:#B1344A');
  expect(html).toContain('--paper:#FAF8F4');
});

it('omits palette vars when palette is null', () => {
  const html = renderToStaticMarkup(
    <OpusV1Layout
      content={fixture.content}
      speakers={fixture.speakers}
      funnelId="funnel-1"
      palette={null}
    />,
  );
  expect(html).not.toContain('--primary:');
});
```

Note: React's HTML serializer outputs CSS properties as `--primary:#B1344A;` (no space after colon). If the assertion fails, adjust to the actual serialized form — use a `toMatch(/--primary:\s*#B1344A/)` regex.

- [ ] **Step 6: Run tests**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform/next-app
pnpm test src/templates/opus-v1/ --run
```

Expect: all pass including 2 new.

- [ ] **Step 7: Build**

```
pnpm build
```

Expect: clean (pre-existing errors aside).

- [ ] **Step 8: Commit**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
git add next-app/src/templates/OpusV1.tsx \
        next-app/src/templates/opus-v1/layout.tsx \
        next-app/src/templates/opus-v1/layout.test.tsx \
        next-app/src/app/preview/[token]/page.tsx \
        next-app/src/app/f/[funnel]/optin/page.tsx
git commit -m "feat(opus-v1): apply audience palette as CSS vars on layout root"
```

---

## Task T13: Smoke + cleanup

- [ ] **Step 1: Full test suite (PHP)**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
php -d memory_limit=512M vendor/bin/pest --compact tests/Unit/Services/Templates/ tests/Feature/Models/ tests/Feature/Filament/SummitResourceTest.php tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php tests/Feature/Services/PublishDraftServiceTest.php
```

Expect: ~25+ Phase 3a-1-relevant tests pass. Pre-existing parallel-session failures remain unchanged.

- [ ] **Step 2: Next.js test suite**

```
cd next-app && pnpm test --run
```

Expect: Phase 2a baseline (273 tests) + ~4 new (palette.test + 2 layout palette tests) = ~277 pass.

- [ ] **Step 3: Manual browser smoke**

(Skippable in auto mode; list for human reviewer.)

1. Start services: `composer dev` + `cd next-app && pnpm dev`.
2. In `/admin`, edit one existing summit. Set its `audience` to **ADHD — Women**. Save.
3. Generate a landing page on opus-v1. Wait for ready.
4. Click **Preview**. Expect: CTAs appear in rose (`#B1344A`); paper background in cream (`#FAF8F4`); overall feel is distinctly ADHD-women, not opus-v1 default ochre.
5. Go back, generate another batch; in the generate form set **Audience override** to **Herbal**. Preview — CTAs now sage green.
6. Publish an ADHD-Women draft. Visit `/f/{funnelId}/optin`. Same colors as preview.
7. Generate a draft using opus-v2 (legacy template). Open preview — colors unchanged (opus-v2 isn't palette-aware yet; expected).

- [ ] **Step 4: Pint + lint**

```
./vendor/bin/pint --dirty --format agent
cd next-app && pnpm lint --fix || true
```

- [ ] **Step 5: Final commit if any lint changes**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
git add -A
git diff --cached --quiet || git commit -m "chore: lint fixes post Phase 3a-1"
```

- [ ] **Step 6: No push without user instruction**

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| `SummitAudience` enum | T1 |
| `AudiencePalettes` map + NEUTRAL | T2 |
| `AudienceResolver` with batch/summit/NEUTRAL cascade | T3 |
| summit.audience + batch.audience_override + draft.audience + draft.palette columns | T4 |
| Model casts | T4 |
| Filament SummitResource audience picker | T5 |
| Filament GenerateLandingPagesPage override picker | T6 |
| Job resolves + stores on draft | T7 |
| PublishDraftService snapshots palette into page_content | T8 |
| API returns palette | T9 |
| Next.js DraftPayload.palette + Palette type + helper | T10 |
| opus-v1 CSS uses universal tokens | T11 |
| OpusV1 applies palette CSS vars | T12 |
| Render routes pass palette | T12 |
| Smoke + cleanup | T13 |

**Out of scope (deferred to Phase 3a-2):** opus-v5 full template port. Phase 3a-1 ships a working palette pipeline with opus-v1 as the only palette-aware template.

**Placeholder scan:** no TBD/TODO in task bodies.

**Type consistency:**
- `Palette` type shape consistent in T10 (definition), T12 (usage).
- `paletteStyle()` signature in T10, consumed in T12.
- `AudienceResolver::resolveForBatch(LandingPageBatch): array` in T3, called in T7.
- `AudiencePalettes::paletteFor(?SummitAudience): array` signature consistent T2, T3.

**Plan complete.**

Save location: `docs/superpowers/plans/2026-04-17-audience-palette-phase-3a-1.md`
Spec: `docs/superpowers/specs/2026-04-17-audience-palette-design.md`
