# Page Content Blocks Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce field bloat in the Filament step editor by collapsing headline trios into single rich-text fields, removing the per-section design fieldset, dropping timezone everywhere, removing per-block dates, and rendering the event status label automatically from `Summit::computePhase()`.

**Architecture:** Backend-only Filament + Laravel changes plus matching Next.js Zod schema relaxations. The on-disk `page_content.content` shape stays the same (Zod-validated by Next.js); the editor's view of it changes. A new transform layer in `TemplateBlockFactory` detects `headlineLead/Accent/Trail` triples and shows one `RichEditor` instead of three text inputs, splitting the HTML on save and re-joining on load. Server computes the formatted event-status label so JS does no timezone math.

**Tech Stack:** Laravel 13 / PHP 8.4, Filament v4, Pest 4, Postgres, Next.js 16 (Zod 3), TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-04-28-page-content-blocks-cleanup-design.md`

---

## File Structure

### Backend (Laravel)

| File | Responsibility | Action |
|------|----------------|--------|
| `app/Services/Templates/HeadlineRichText.php` | Pure helpers: split rich-text HTML into `lead/accent/trail` and rejoin. | **Create** |
| `app/Services/Templates/TemplateBlockFactory.php` | Drop design fieldset; emit one `RichEditor` for headline trios; round-trip via `HeadlineRichText`. | Modify |
| `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php` | Remove `__design`/`page_overrides.sections` round-trip; same for `getPreviewContent()`. | Modify |
| `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php` | Same removals as above. | Modify (verify) |
| `app/Models/Summit.php` | Drop `timezone` from `$fillable`; add `eventStatusLabel()`, `formattedDateRange()`. | Modify |
| `app/Filament/Resources/Summits/SummitResource.php` | Remove timezone form field. | Modify |
| `app/Http/Controllers/Api/FunnelResolveController.php` | Add `event_status` + `event_status_label` + `start_date`/`end_date` to summit payload. | Modify |
| `database/migrations/2026_04_28_000000_drop_timezone_from_summits.php` | Drop `summits.timezone` column. | **Create** |

### Frontend (Next.js)

| File | Responsibility | Action |
|------|----------------|--------|
| `next-app/src/templates/*.schema.ts` (×8) | Remove `summit.timezone`; relax `headlineAccent.min(1)` to `.optional()`; remove `topBar.dateRangeLabel`/`hero.dateRangeLabel` (use server-computed). | Modify |
| `next-app/src/templates/__fixtures__/*.fixture.ts` | Drop `timezone` from fixtures. | Modify |
| `next-app/src/templates/**/skins/TopBar.tsx`, `Hero.tsx` (per template) | Read `summit.eventStatusLabel` instead of `topBar.dateRangeLabel`/`hero.dateRangeLabel`. | Modify |

### Tests

| File | Responsibility | Action |
|------|----------------|--------|
| `tests/Unit/Services/Templates/HeadlineRichTextTest.php` | Round-trip + edge cases for the split/join helper. | **Create** |
| `tests/Unit/Services/Templates/TemplateBlockFactoryHeadlineTest.php` | Headline trio collapses to one `RichEditor`; design fieldset gone. | **Create** |
| `tests/Unit/Models/SummitEventStatusTest.php` | `eventStatusLabel()` covers each phase + same-month / cross-month / cross-year. | **Create** |
| `tests/Feature/Filament/EditFunnelStepHeadlineTest.php` | Editor fill + save preserves data through the rich-text round-trip. | **Create** |

---

## Task 1: Create the `HeadlineRichText` helper

**Files:**
- Create: `app/Services/Templates/HeadlineRichText.php`
- Test: `tests/Unit/Services/Templates/HeadlineRichTextTest.php`

This is the pure split/join used by the Builder factory to round-trip the three Zod string slots through one rich-text input.

Rules:

- `split('A<em>b</em>c') === ['lead' => 'A', 'accent' => 'b', 'trail' => 'c']`
- `split('Just text') === ['lead' => 'Just text', 'accent' => '', 'trail' => '']`
- `split('A<em>b</em>')  === ['lead' => 'A', 'accent' => 'b', 'trail' => '']`
- `split('<em>b</em>c')  === ['lead' => '', 'accent' => 'b', 'trail' => 'c']`
- `split('') === ['lead' => '', 'accent' => '', 'trail' => '']`
- All other inline tags (`<strong>`, `<i>`, `<a>`) — strip HTML except the **first** `<em>...</em>`. `<i>` is treated as `<em>`.
- Decode HTML entities in returned strings (`&amp;` → `&`, `&nbsp;` → space, etc.).
- `join(['lead' => 'A', 'accent' => 'b', 'trail' => 'c']) === 'A<em>b</em>c'`
- `join` HTML-escapes each part (`<`, `>`, `&`, `"`).
- Empty `accent` → `join` returns just `lead . trail` with no `<em>`.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Unit\Services\Templates;

use App\Services\Templates\HeadlineRichText;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class HeadlineRichTextTest extends TestCase
{
    #[DataProvider('splitCases')]
    public function test_split(string $html, array $expected): void
    {
        $this->assertSame($expected, HeadlineRichText::split($html));
    }

    public static function splitCases(): array
    {
        return [
            'three parts' => [
                'A<em>b</em>c',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
            ],
            'plain text' => [
                'Just text',
                ['lead' => 'Just text', 'accent' => '', 'trail' => ''],
            ],
            'lead + accent only' => [
                'A<em>b</em>',
                ['lead' => 'A', 'accent' => 'b', 'trail' => ''],
            ],
            'accent + trail only' => [
                '<em>b</em>c',
                ['lead' => '', 'accent' => 'b', 'trail' => 'c'],
            ],
            'empty' => [
                '',
                ['lead' => '', 'accent' => '', 'trail' => ''],
            ],
            'i tag treated as em' => [
                'A<i>b</i>c',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
            ],
            'strips other tags' => [
                'A<strong>x</strong><em>b</em>c',
                ['lead' => 'Ax', 'accent' => 'b', 'trail' => 'c'],
            ],
            'multiple em — only first counts' => [
                'A<em>b</em>c<em>d</em>e',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'cde'],
            ],
            'decodes entities' => [
                'Tea &amp; biscuits<em>now</em>',
                ['lead' => 'Tea & biscuits', 'accent' => 'now', 'trail' => ''],
            ],
            'paragraph wrapper from RichEditor' => [
                '<p>A<em>b</em>c</p>',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
            ],
        ];
    }

    #[DataProvider('joinCases')]
    public function test_join(array $parts, string $expected): void
    {
        $this->assertSame($expected, HeadlineRichText::join($parts));
    }

    public static function joinCases(): array
    {
        return [
            'three parts' => [
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
                'A<em>b</em>c',
            ],
            'empty accent skips em' => [
                ['lead' => 'Hello world', 'accent' => '', 'trail' => ''],
                'Hello world',
            ],
            'escapes html in parts' => [
                ['lead' => 'A & B', 'accent' => '<x>', 'trail' => '"end"'],
                'A &amp; B<em>&lt;x&gt;</em>&quot;end&quot;',
            ],
        ];
    }

    public function test_round_trip(): void
    {
        $original = ['lead' => 'Your bright, ', 'accent' => 'busy-minded', 'trail' => ' child is not a problem to be solved.'];
        $html = HeadlineRichText::join($original);
        $back = HeadlineRichText::split($html);
        $this->assertSame($original, $back);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=HeadlineRichTextTest`
Expected: FAIL — class `App\Services\Templates\HeadlineRichText` does not exist.

- [ ] **Step 3: Implement `HeadlineRichText`**

```php
<?php

namespace App\Services\Templates;

class HeadlineRichText
{
    /**
     * Split rich-text HTML into the three canonical strings the renderer expects.
     *
     * The first `<em>...</em>` (or `<i>...</i>`) becomes the accent. Text before
     * is `lead`; text after is `trail`. Other inline tags are stripped. HTML
     * entities are decoded. A surrounding `<p>` wrapper from RichEditor output
     * is unwrapped.
     *
     * @return array{lead: string, accent: string, trail: string}
     */
    public static function split(string $html): array
    {
        $html = trim($html);
        if ($html === '') {
            return ['lead' => '', 'accent' => '', 'trail' => ''];
        }

        // Unwrap a single outer <p>...</p> from RichEditor output.
        if (preg_match('#^<p>(.*)</p>$#s', $html, $m)) {
            $html = $m[1];
        }

        // Normalize <i> to <em>.
        $html = preg_replace('#<\s*i(\s[^>]*)?>#i', '<em>', $html) ?? $html;
        $html = preg_replace('#<\s*/\s*i\s*>#i', '</em>', $html) ?? $html;

        if (preg_match('#^(.*?)<em(?:\s[^>]*)?>(.*?)</em>(.*)$#s', $html, $m)) {
            return [
                'lead' => self::clean($m[1]),
                'accent' => self::clean($m[2]),
                'trail' => self::clean($m[3]),
            ];
        }

        return [
            'lead' => self::clean($html),
            'accent' => '',
            'trail' => '',
        ];
    }

    /**
     * Inverse of {@see split()}. Empty accent omits the `<em>` wrapper.
     *
     * @param  array{lead?: string, accent?: string, trail?: string}  $parts
     */
    public static function join(array $parts): string
    {
        $lead = htmlspecialchars((string) ($parts['lead'] ?? ''), ENT_QUOTES);
        $accent = htmlspecialchars((string) ($parts['accent'] ?? ''), ENT_QUOTES);
        $trail = htmlspecialchars((string) ($parts['trail'] ?? ''), ENT_QUOTES);

        if ($accent === '') {
            return $lead.$trail;
        }

        return $lead.'<em>'.$accent.'</em>'.$trail;
    }

    private static function clean(string $fragment): string
    {
        $stripped = strip_tags($fragment);

        return html_entity_decode($stripped, ENT_QUOTES, 'UTF-8');
    }
}
```

- [ ] **Step 4: Run tests**

Run: `php artisan test --compact --filter=HeadlineRichTextTest`
Expected: PASS — 13 assertions across split/join/round-trip cases.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 6: Commit**

```bash
git add app/Services/Templates/HeadlineRichText.php tests/Unit/Services/Templates/HeadlineRichTextTest.php
git commit -m "feat(templates): add HeadlineRichText split/join helper for rich-text consolidation"
```

---

## Task 2: Detect headline trios in `TemplateBlockFactory` and emit one `RichEditor`

**Files:**
- Modify: `app/Services/Templates/TemplateBlockFactory.php`
- Modify: `app/Services/Templates/FilamentSchemaMapper.php`
- Test: `tests/Unit/Services/Templates/TemplateBlockFactoryHeadlineTest.php`

The factory currently calls `FilamentSchemaMapper::map()` which emits one component per property. We add detection at the section level: if a section's `properties` contain all three of `headlineLead` / `headlineAccent` / `headlineTrail`, we replace those three with one `RichEditor` named `__headline` (with `dehydrateStateUsing` / `mutateDehydratedStateUsing` doing the round-trip via `HeadlineRichText`).

Why a synthetic key (`__headline`) rather than reusing one of the three? Because Filament Builder's `data` map is what gets persisted; we want all three originals to land in `data` keyed by their original Zod names so `unwrapValueFromBlock` produces the same on-disk shape it does today. The `__headline` field is an editor-only key that gets stripped during save and turned back into the three on fill via the section-level pre-fill hook described in Task 3.

We'll do this **inside `TemplateBlockFactory::fieldsForSection()`** — pre-process the properties list before handing to the mapper:

- Pull `headlineLead/Accent/Trail` out of `$propSchema['properties']`.
- Remove them from `required` if present.
- Emit a `Filament\Forms\Components\RichEditor` field named `__headline` with the constrained toolbar.

We also add a public method `splitHeadlineFields(array $section): array` and `joinHeadlineFields(array $data): array` so the page-level mutate hooks in `EditFunnelStep` can run the conversion.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Unit\Services\Templates;

use App\Models\FunnelStep;
use App\Models\Summit;
use App\Models\Funnel;
use App\Services\Templates\TemplateBlockFactory;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\RichEditor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateBlockFactoryHeadlineTest extends TestCase
{
    use RefreshDatabase;

    public function test_headline_trio_collapses_to_one_rich_editor(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => ['template_key' => 'cream-sage', 'content' => []],
        ]);

        $blocks = app(TemplateBlockFactory::class)->blocksForStep($step);

        $hero = collect($blocks)->first(fn (Block $b) => $b->getName() === 'hero');
        $this->assertNotNull($hero, 'hero block must exist');

        $children = $hero->getChildComponents();
        $names = collect($children)->map(fn ($c) => $c->getName())->all();

        $this->assertContains('__headline', $names);
        $this->assertNotContains('headlineLead', $names);
        $this->assertNotContains('headlineAccent', $names);
        $this->assertNotContains('headlineTrail', $names);

        $headline = collect($children)->first(fn ($c) => $c->getName() === '__headline');
        $this->assertInstanceOf(RichEditor::class, $headline);
    }

    public function test_design_fieldset_is_removed(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => ['template_key' => 'cream-sage', 'content' => []],
        ]);

        $blocks = app(TemplateBlockFactory::class)->blocksForStep($step);

        foreach ($blocks as $block) {
            $children = collect($block->getChildComponents());
            $designFieldsets = $children->filter(
                fn ($c) => $c instanceof \Filament\Schemas\Components\Fieldset
                    && str_contains((string) $c->getLabel(), 'Design'),
            );
            $this->assertCount(0, $designFieldsets, "Block {$block->getName()} still has Design fieldset");
        }
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=TemplateBlockFactoryHeadlineTest`
Expected: FAIL — `__headline` not in children, design fieldset still present.

- [ ] **Step 3: Modify `TemplateBlockFactory`**

Replace `fieldsForSection` and `blocksForStep` and remove `sectionDesignFieldset()`:

```php
// Top of file, add imports:
use Filament\Forms\Components\RichEditor;
// remove ColorPicker, Select, Fieldset imports if unused
```

Replace `blocksForStep` (around line 174) — strip the `sectionDesignFieldset()` merge:

```php
public function blocksForStep(?FunnelStep $step): array
{
    $pageContent = $step?->page_content;
    $templateKey = is_array($pageContent) ? ($pageContent['template_key'] ?? null) : null;

    if (! is_string($templateKey) || ! $this->registry->exists($templateKey)) {
        return [];
    }

    $summitId = $step?->funnel?->summit_id;
    $cacheKey = ($step?->getKey() ?? 'new').'|'.$templateKey.'|'.($summitId ?? '');
    if (isset(self::$blocksForStepCache[$cacheKey])) {
        return self::$blocksForStepCache[$cacheKey];
    }

    $schema = $this->registry->get($templateKey)['jsonSchema'] ?? null;
    if (! is_array($schema) || ($schema['type'] ?? null) !== 'object') {
        return self::$blocksForStepCache[$cacheKey] = [];
    }

    $blocks = [];
    foreach ($schema['properties'] ?? [] as $name => $propSchema) {
        if (! is_array($propSchema)) {
            continue;
        }
        $name = (string) $name;
        $blocks[] = Block::make($name)
            ->label($this->humanize($name))
            ->icon($this->iconFor($name))
            ->schema($this->fieldsForSection($propSchema, $summitId));
    }

    return self::$blocksForStepCache[$cacheKey] = $blocks;
}
```

Replace `fieldsForSection`:

```php
/**
 * @param  array<string, mixed>  $propSchema
 * @return list<Component>
 */
private function fieldsForSection(array $propSchema, ?string $summitId): array
{
    if (($propSchema['type'] ?? null) !== 'object') {
        return $this->mapper->map([
            'type' => 'object',
            'properties' => ['value' => $propSchema],
            'required' => [],
        ], $summitId);
    }

    $consolidated = $this->consolidateHeadlineTrio($propSchema);

    $fields = $this->mapper->map($consolidated['schema'], $summitId);

    if ($consolidated['hasTrio']) {
        $fields = array_merge([$this->buildHeadlineRichEditor()], $fields);
    }

    return $fields;
}

/**
 * Strip headlineLead/Accent/Trail from a section's properties so the mapper
 * doesn't emit three text inputs for them. The caller prepends a single
 * RichEditor instead.
 *
 * @param  array<string, mixed>  $propSchema
 * @return array{schema: array<string, mixed>, hasTrio: bool}
 */
private function consolidateHeadlineTrio(array $propSchema): array
{
    $properties = $propSchema['properties'] ?? [];
    $hasTrio = isset($properties['headlineLead'], $properties['headlineAccent'], $properties['headlineTrail']);

    if (! $hasTrio) {
        return ['schema' => $propSchema, 'hasTrio' => false];
    }

    unset(
        $properties['headlineLead'],
        $properties['headlineAccent'],
        $properties['headlineTrail'],
    );
    $propSchema['properties'] = $properties;

    if (isset($propSchema['required']) && is_array($propSchema['required'])) {
        $propSchema['required'] = array_values(array_diff(
            $propSchema['required'],
            ['headlineLead', 'headlineAccent', 'headlineTrail'],
        ));
    }

    return ['schema' => $propSchema, 'hasTrio' => true];
}

private function buildHeadlineRichEditor(): RichEditor
{
    return RichEditor::make('__headline')
        ->label('Title')
        ->toolbarButtons(['bold', 'italic', 'link'])
        ->columnSpanFull();
}
```

Delete the `sectionDesignFieldset()` method entirely (around lines 220–251).

Add headline conversion helpers (used by Task 3):

```php
/**
 * On fill: take a section data map containing headlineLead/Accent/Trail
 * (canonical on-disk shape) and replace them with a single `__headline`
 * HTML field that the RichEditor binds to.
 *
 * @param  array<string, mixed>  $sectionData
 * @return array<string, mixed>
 */
public function splitToEditorShape(array $sectionData): array
{
    if (! isset($sectionData['headlineLead'], $sectionData['headlineAccent'], $sectionData['headlineTrail'])
        && ! isset($sectionData['headlineLead'])) {
        return $sectionData;
    }

    $sectionData['__headline'] = HeadlineRichText::join([
        'lead' => (string) ($sectionData['headlineLead'] ?? ''),
        'accent' => (string) ($sectionData['headlineAccent'] ?? ''),
        'trail' => (string) ($sectionData['headlineTrail'] ?? ''),
    ]);

    unset($sectionData['headlineLead'], $sectionData['headlineAccent'], $sectionData['headlineTrail']);

    return $sectionData;
}

/**
 * On save: take a section data map with `__headline` (HTML) and replace it
 * with the canonical headlineLead/Accent/Trail strings.
 *
 * @param  array<string, mixed>  $sectionData
 * @return array<string, mixed>
 */
public function joinFromEditorShape(array $sectionData): array
{
    if (! array_key_exists('__headline', $sectionData)) {
        return $sectionData;
    }

    $parts = HeadlineRichText::split((string) $sectionData['__headline']);
    unset($sectionData['__headline']);

    $sectionData['headlineLead'] = $parts['lead'];
    $sectionData['headlineAccent'] = $parts['accent'];
    $sectionData['headlineTrail'] = $parts['trail'];

    return $sectionData;
}
```

And import at the top: `use App\Services\Templates\HeadlineRichText;`

- [ ] **Step 4: Run test**

Run: `php artisan test --compact --filter=TemplateBlockFactoryHeadlineTest`
Expected: PASS — both tests green.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 6: Commit**

```bash
git add app/Services/Templates/TemplateBlockFactory.php tests/Unit/Services/Templates/TemplateBlockFactoryHeadlineTest.php
git commit -m "feat(templates): collapse headline trios to one RichEditor; remove per-section Design fieldset"
```

---

## Task 3: Wire headline split/join + remove design overrides in `EditFunnelStep`

**Files:**
- Modify: `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php`
- Test: `tests/Feature/Filament/EditFunnelStepHeadlineTest.php`

The factory now emits `__headline`. We need to:

1. On `mutateFormDataBeforeFill`: walk each block's `data`, run `splitToEditorShape`.
2. On `mutateFormDataBeforeSave`: walk each block's `data`, run `joinFromEditorShape`.
3. Strip the `__design` extraction code from both fill and save paths.
4. Strip the `page_overrides.sections` injection.
5. `getPreviewContent` and `updateContentPath` get the same treatment (preview must show italic accent live).
6. Delete the now-unused `isNonEmptyDesign` helper.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use function Pest\Livewire\livewire;

class EditFunnelStepHeadlineTest extends TestCase
{
    use RefreshDatabase;

    public function test_fill_splits_headline_into_rich_text(): void
    {
        $this->actingAs(User::factory()->create());

        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => [
                'template_key' => 'cream-sage',
                'content' => [
                    'hero' => [
                        'headlineLead' => 'A ',
                        'headlineAccent' => 'gentle',
                        'headlineTrail' => ' summit.',
                    ],
                ],
            ],
        ]);

        livewire(EditFunnelStep::class, ['record' => $step->getRouteKey()])
            ->assertSet('data.page_content.0.data.__headline', 'A <em>gentle</em> summit.');
    }

    public function test_save_re_joins_rich_text_into_three_strings(): void
    {
        $this->actingAs(User::factory()->create());

        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => [
                'template_key' => 'cream-sage',
                'content' => [
                    'hero' => [
                        'headlineLead' => 'old ',
                        'headlineAccent' => 'old',
                        'headlineTrail' => ' old',
                    ],
                ],
            ],
        ]);

        livewire(EditFunnelStep::class, ['record' => $step->getRouteKey()])
            ->set('data.page_content.0.data.__headline', 'New <em>brilliant</em> headline.')
            ->call('save');

        $step->refresh();

        $this->assertSame('New ', $step->page_content['content']['hero']['headlineLead']);
        $this->assertSame('brilliant', $step->page_content['content']['hero']['headlineAccent']);
        $this->assertSame(' headline.', $step->page_content['content']['hero']['headlineTrail']);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=EditFunnelStepHeadlineTest`
Expected: FAIL — `__headline` not present in form state (or design extraction still runs).

- [ ] **Step 3: Modify `EditFunnelStep::mutateFormDataBeforeFill`**

Replace the method body (currently lines 95–117):

```php
protected function mutateFormDataBeforeFill(array $data): array
{
    $factory = app(TemplateBlockFactory::class);
    $list = $factory->mapToBuilderList($data['page_content'] ?? null);

    foreach ($list as $i => $block) {
        if (! is_array($block) || ! isset($block['data']) || ! is_array($block['data'])) {
            continue;
        }
        $list[$i]['data'] = $factory->splitToEditorShape($block['data']);
    }

    $data['page_content'] = $list;

    return $data;
}
```

- [ ] **Step 4: Modify `EditFunnelStep::mutateFormDataBeforeSave`**

Replace the method body (currently lines 127–156):

```php
protected function mutateFormDataBeforeSave(array $data): array
{
    $factory = app(TemplateBlockFactory::class);
    $original = $this->record->page_content;

    $list = is_array($data['page_content'] ?? null) ? $data['page_content'] : [];
    foreach ($list as $i => $block) {
        if (! is_array($block) || ! isset($block['data']) || ! is_array($block['data'])) {
            continue;
        }
        $list[$i]['data'] = $factory->joinFromEditorShape($block['data']);
    }

    $data['page_content'] = $factory->builderListToMap(
        $list,
        is_array($original) ? $original : null,
    );

    return $data;
}
```

- [ ] **Step 5: Modify `EditFunnelStep::getPreviewContent`**

Replace the method body (currently lines 231–267):

```php
public function getPreviewContent(): array
{
    $formData = $this->form->getState();
    $original = $this->record->page_content;
    $factory = app(TemplateBlockFactory::class);

    $list = is_array($formData['page_content'] ?? null) ? $formData['page_content'] : [];
    foreach ($list as $i => $block) {
        if (! is_array($block) || ! isset($block['data']) || ! is_array($block['data'])) {
            continue;
        }
        $list[$i]['data'] = $factory->joinFromEditorShape($block['data']);
    }

    $map = $factory->builderListToMap($list, is_array($original) ? $original : null);

    $overrides = $formData['page_overrides'] ?? $this->record->page_overrides;
    $map['tokens'] = is_array($overrides) && isset($overrides['tokens']) && is_array($overrides['tokens'])
        ? $overrides['tokens']
        : null;

    return $map;
}
```

- [ ] **Step 6: Delete `isNonEmptyDesign`**

Remove the private static method at lines 162–178.

- [ ] **Step 7: Update the `updated()` hook**

Replace the `updated()` method body to drop the `data.page_overrides` reference (we still keep page_overrides for the **global** tokens, but we no longer write per-section overrides):

```php
public function updated(string $name): void
{
    if (str_starts_with($name, 'data.page_content') || str_starts_with($name, 'data.page_overrides')) {
        $this->dispatch('form-updated');
    }
}
```

(No change needed — the existing condition still applies. Skip if already correct.)

- [ ] **Step 8: Run tests**

Run: `php artisan test --compact --filter=EditFunnelStepHeadlineTest`
Expected: PASS — both tests green.

Run also: `php artisan test --compact --filter=TemplateBlockFactoryHeadlineTest`
Expected: PASS.

- [ ] **Step 9: Mirror the same changes in `EditLandingPageDraftPage.php`**

Open `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php`. Find any equivalent `__design` / `page_overrides.sections` round-trip and apply the same simplification (split/join headline, drop design fieldset round-trip). If the file does not have such code, leave it alone.

- [ ] **Step 10: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 11: Commit**

```bash
git add app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php tests/Feature/Filament/EditFunnelStepHeadlineTest.php
git commit -m "feat(filament): split/join headline rich-text on fill/save; drop per-section design round-trip"
```

---

## Task 4: Add `Summit::eventStatusLabel()` and `formattedDateRange()`

**Files:**
- Modify: `app/Models/Summit.php`
- Test: `tests/Unit/Models/SummitEventStatusTest.php`

`computePhase()` already exists. We add:

- `formattedDateRange()` — formats `during_summit_starts_at` and `ends_at` (or `pre_summit_starts_at` if `during` is null) as a locale-en human range. Same month → `27–29 April`. Different months → `30 April – 2 May`. Different years → `30 Dec 2026 – 2 Jan 2027`.
- `eventStatusLabel()` — returns the rendered string per phase mapping in the spec.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Unit\Models;

use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SummitEventStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_label_is_event_dates_in_pre_phase(): void
    {
        Carbon::setTestNow('2026-04-15 10:00:00');

        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => '2026-04-10 00:00:00',
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
            'post_summit_starts_at' => '2026-04-30 00:00:00',
        ]);

        $this->assertSame('ONLINE Event, 27–29 April', $summit->eventStatusLabel());
    }

    public function test_label_is_event_live_in_during_phase(): void
    {
        Carbon::setTestNow('2026-04-28 12:00:00');

        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => '2026-04-10 00:00:00',
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
            'post_summit_starts_at' => '2026-04-30 00:00:00',
        ]);

        $this->assertSame('Event live', $summit->eventStatusLabel());
    }

    public function test_label_is_event_ended_in_post_phase(): void
    {
        Carbon::setTestNow('2026-05-05 12:00:00');

        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => '2026-04-10 00:00:00',
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
            'post_summit_starts_at' => '2026-04-30 00:00:00',
        ]);

        $this->assertSame('Event ended', $summit->eventStatusLabel());
    }

    public function test_label_is_empty_when_no_dates(): void
    {
        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => null,
            'late_pre_summit_starts_at' => null,
            'during_summit_starts_at' => null,
            'post_summit_starts_at' => null,
            'ends_at' => null,
        ]);

        $this->assertSame('', $summit->eventStatusLabel());
    }

    public function test_formatted_date_range_same_month(): void
    {
        $summit = Summit::factory()->create([
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
        ]);

        $this->assertSame('27–29 April', $summit->formattedDateRange());
    }

    public function test_formatted_date_range_different_months(): void
    {
        $summit = Summit::factory()->create([
            'during_summit_starts_at' => '2026-04-30 00:00:00',
            'ends_at' => '2026-05-02 23:59:59',
        ]);

        $this->assertSame('30 April – 2 May', $summit->formattedDateRange());
    }

    public function test_formatted_date_range_different_years(): void
    {
        $summit = Summit::factory()->create([
            'during_summit_starts_at' => '2026-12-30 00:00:00',
            'ends_at' => '2027-01-02 23:59:59',
        ]);

        $this->assertSame('30 Dec 2026 – 2 Jan 2027', $summit->formattedDateRange());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=SummitEventStatusTest`
Expected: FAIL — methods do not exist.

- [ ] **Step 3: Add the methods to `Summit`**

Append to `app/Models/Summit.php` (before the closing `}`):

```php
public function eventStatusLabel(): string
{
    $phase = $this->computePhase();

    if ($phase === 'during') {
        return 'Event live';
    }
    if ($phase === 'post') {
        return 'Event ended';
    }

    $range = $this->formattedDateRange();
    if ($range === '') {
        return '';
    }

    return 'ONLINE Event, '.$range;
}

public function formattedDateRange(): string
{
    $start = $this->during_summit_starts_at ?? $this->pre_summit_starts_at;
    $end = $this->ends_at;

    if (! $start || ! $end) {
        return '';
    }

    if ($start->year !== $end->year) {
        return $start->format('j M Y').' – '.$end->format('j M Y');
    }

    if ($start->month !== $end->month) {
        return $start->format('j F').' – '.$end->format('j F');
    }

    return $start->format('j').'–'.$end->format('j F');
}
```

- [ ] **Step 4: Run tests**

Run: `php artisan test --compact --filter=SummitEventStatusTest`
Expected: PASS — 7 tests green.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 6: Commit**

```bash
git add app/Models/Summit.php tests/Unit/Models/SummitEventStatusTest.php
git commit -m "feat(summit): add eventStatusLabel and formattedDateRange accessors"
```

---

## Task 5: Drop `summits.timezone` column and remove from Filament + payload

**Files:**
- Create: `database/migrations/2026_04_28_000000_drop_timezone_from_summits.php`
- Modify: `app/Models/Summit.php`
- Modify: `app/Filament/Resources/Summits/SummitResource.php`
- Modify: `app/Http/Controllers/Api/FunnelResolveController.php`

- [ ] **Step 1: Create the migration**

Run: `php artisan make:migration drop_timezone_from_summits --no-interaction`

(Filename will have a different timestamp prefix; that's fine.)

Replace the generated body with:

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
            $table->dropColumn('timezone');
        });
    }

    public function down(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->string('timezone')->nullable();
        });
    }
};
```

- [ ] **Step 2: Remove `timezone` from `Summit::$fillable`**

Edit `app/Models/Summit.php`. Remove `'timezone',` from the `$fillable` array (line 36).

- [ ] **Step 3: Remove timezone field from `SummitResource`**

Open `app/Filament/Resources/Summits/SummitResource.php`. Search for the timezone form input and delete the entire component definition (the `Select::make('timezone')` or `TextInput::make('timezone')` and any chained calls). Verify the form still compiles by reading the surrounding `->schema([...])` for syntax.

- [ ] **Step 4: Add new fields to `FunnelResolveController` payload**

Edit `app/Http/Controllers/Api/FunnelResolveController.php`. In the `summit` array (around lines 52–59), replace with:

```php
'summit' => [
    'id' => $summit->id,
    'title' => $summit->title,
    'description' => $summit->description,
    'starts_at' => $summit->during_summit_starts_at ?? $summit->pre_summit_starts_at,
    'ends_at' => $summit->ends_at,
    'current_phase' => $summit->current_phase,
    'event_status_label' => $summit->eventStatusLabel(),
],
```

- [ ] **Step 5: Run migration**

Run: `php artisan migrate --no-interaction`

Verify: `php artisan tinker --execute 'echo Schema::hasColumn("summits", "timezone") ? "still present" : "dropped";'`
Expected output: `dropped`.

- [ ] **Step 6: Run all backend tests**

Run: `php artisan test --compact`
Expected: PASS. If any test references `summit->timezone` or sets it on a factory, fix the test by removing the reference (it's now non-existent).

- [ ] **Step 7: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 8: Commit**

```bash
git add database/migrations/*drop_timezone_from_summits.php app/Models/Summit.php app/Filament/Resources/Summits/SummitResource.php app/Http/Controllers/Api/FunnelResolveController.php
git commit -m "refactor(summit): drop timezone column; payload now includes event_status_label"
```

---

## Task 6: Update Next.js Zod schemas — drop timezone, relax accent, expose status label

**Files:**
- Modify: `next-app/src/templates/blue-coral.schema.ts`
- Modify: `next-app/src/templates/cream-sage.schema.ts`
- Modify: `next-app/src/templates/green-gold.schema.ts`
- Modify: `next-app/src/templates/indigo-gold.schema.ts`
- Modify: `next-app/src/templates/lime-ink.schema.ts`
- Modify: `next-app/src/templates/ochre-ink.schema.ts`
- Modify: `next-app/src/templates/rust-cream.schema.ts`
- Modify: `next-app/src/templates/violet-sun.schema.ts`
- Modify: `next-app/src/templates/__fixtures__/*.fixture.ts` (all)

For each schema file:

1. Inside the `summit: z.object({...})` block, remove the `timezone: z.string(),` line.
2. For every `headlineAccent: z.string().min(1),` (and `.min(N)` variants), replace with `headlineAccent: z.string().optional(),`. Operators may now save a headline with no accent word.

For each fixture file:

1. Remove the `timezone: 'America/New_York',` line inside the `summit:` literal.

> **Note:** read `next-app/AGENTS.md` first before editing — the project uses a non-standard Next.js 16. Schemas are pure Zod, but if any Vitest test imports a fixture that no longer matches the schema, the test will fail.

- [ ] **Step 1: Edit each schema file**

For each of the 8 schema files, apply both changes. Concrete example for `cream-sage.schema.ts`:

Before:
```ts
summit: z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  timezone: z.string(),
}),
```

After:
```ts
summit: z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
}),
```

And for each `headlineAccent: z.string().min(1)` occurrence in that file, replace with `headlineAccent: z.string().optional()`.

- [ ] **Step 2: Edit each fixture file**

Remove `timezone: 'America/New_York',` from each fixture's `summit:` block. List of fixtures:

```bash
ls next-app/src/templates/__fixtures__/*.fixture.ts
```

- [ ] **Step 3: Run frontend type-check**

Run: `cd next-app && pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Run frontend tests**

Run: `cd next-app && pnpm test --run`
Expected: PASS. Schema unit tests `green-gold.schema.test.ts` and `violet-sun.schema.test.ts` reference `summit.startDate` (still present) so they should pass. If any test asserts `timezone` exists, delete those assertions.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/templates/*.schema.ts next-app/src/templates/__fixtures__/*.fixture.ts
git commit -m "chore(templates): drop summit.timezone; relax headlineAccent to optional"
```

---

## Task 7: Update Next.js renderers to use `event_status_label`

**Files:**
- Modify: per-template `skins/TopBar.tsx` and `skins/Hero.tsx` for each of the 8 templates.

The summit payload from Laravel now includes `event_status_label`. Renderers must consume it where they currently render `topBar.dateRangeLabel` / `hero.dateRangeLabel`. The schema fields stay (we don't break older payloads) but the skin reads server-computed value first, falling back to the per-block string only when the new field is missing.

- [ ] **Step 1: Locate every reference**

Run: `grep -rn "dateRangeLabel" next-app/src/templates/`

- [ ] **Step 2: Update each occurrence**

For each `<X>{topBar.dateRangeLabel}</X>` (and the equivalent for `hero.dateRangeLabel`), change to:

```tsx
<X>{summit.eventStatusLabel ?? topBar.dateRangeLabel}</X>
```

…where `summit` is whatever the skin already imports as the summit context (typically passed via the page-level prop). If a skin doesn't currently take `summit`, thread it through the props (the parent template index/bridge already passes the summit context, see `next-app/src/templates/cream-sage/index.tsx` for the wiring pattern).

- [ ] **Step 3: Type-check**

Run: `cd next-app && pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Tests**

Run: `cd next-app && pnpm test --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/templates
git commit -m "feat(templates): renderers read summit.eventStatusLabel for top-bar/hero status string"
```

---

## Task 8: Browser smoke test — edit a step, save, verify rich-text round-trip

**Files:**
- Modify or create: `tests/Browser/EditStepHeadlineSmokeTest.php`

This is the integration check that the editor flow actually works end-to-end with Filament's RichEditor (which uses TipTap behind the scenes).

- [ ] **Step 1: Write the smoke test**

```php
<?php

namespace Tests\Browser;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditStepHeadlineSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_edit_step_renders_rich_text_title_and_persists_round_trip(): void
    {
        $admin = User::factory()->create();
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => [
                'template_key' => 'cream-sage',
                'content' => [
                    'hero' => [
                        'headlineLead' => 'Your bright, ',
                        'headlineAccent' => 'busy-minded',
                        'headlineTrail' => ' child is not a problem to be solved.',
                    ],
                ],
            ],
        ]);

        $this->actingAs($admin)
            ->visit(route('filament.admin.resources.funnel-steps.edit', $step))
            ->assertSee('Title')
            ->assertSee('busy-minded')
            ->assertDontSee('Headline Lead')
            ->assertDontSee('Headline Accent')
            ->assertDontSee('Headline Trail')
            ->assertDontSee('Design (this section)');
    }
}
```

- [ ] **Step 2: Run smoke test**

Run: `php artisan test --compact --filter=EditStepHeadlineSmokeTest`
Expected: PASS.

- [ ] **Step 3: Run full backend suite**

Run: `php artisan test --compact`
Expected: All green. Investigate any failures — most likely places: tests that hard-code `timezone` on a Summit factory, tests that assert against the Builder's old field count, or tests that reference `__design`.

- [ ] **Step 4: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 5: Commit**

```bash
git add tests/Browser/EditStepHeadlineSmokeTest.php
git commit -m "test(browser): smoke-test rich-text title + design fieldset removed in step editor"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full backend test suite**

Run: `php artisan test --compact`
Expected: All green.

- [ ] **Step 2: Run full frontend test suite**

Run: `cd next-app && pnpm test --run && pnpm typecheck`
Expected: All green.

- [ ] **Step 3: Visit the editor in dev**

Start the dev server (`composer dev`), open `/admin/funnel-steps/<id>/edit` for a `cream-sage` step. Verify:
- Title field is one rich-text input.
- Italic the middle word — see it become `<em>` in the saved HTML.
- Save, refresh — italic preserved.
- No "Design (this section)" fieldset on any block.
- No "Timezone" field on the Summit edit page.
- No date inputs on the `summit` block.

- [ ] **Step 4: If everything passes, confirm the branch is ready for review**

Run: `git log --oneline cro..HEAD`
Confirm one commit per task, descriptive messages, no scratch work.

---

## Self-review

**Spec coverage:**

| Spec section | Tasks | Notes |
|--------------|-------|-------|
| 1. Rich-text consolidation — headline trio | Task 1 (helper) + Task 2 (factory) + Task 3 (page mutate hooks) + Task 8 (smoke) | Paragraph trio dropped from plan — no current schemas use it (YAGNI). |
| 2. Per-section Design fieldset removed | Task 2 (factory) + Task 3 (page hooks strip `__design`) | Existing `page_overrides.sections` data left in place per spec. |
| 3. Timezone removed | Task 5 (column drop, model, Filament, payload) + Task 6 (Zod schemas + fixtures) + Task 7 (renderers) | Renderer fallback `'America/New_York'` constant unnecessary — no JS reads timezone after Task 7. |
| 4. Dates single source on Summit | Task 5 (payload `starts_at`/`ends_at`) + Task 7 (renderers) | Per-block `startDate`/`endDate` stay in schemas (they're under `summit:` key); Task 7 makes renderers prefer `event_status_label` instead. |
| 5. Auto event-status label | Task 4 (model methods) + Task 5 (payload) + Task 7 (renderer consumption) | Server-computed; no JS date math. |

**Placeholder scan:** None — every code step shows complete code. The "find and replace" steps in Tasks 6/7 list explicit before/after diffs and the grep command to enumerate occurrences.

**Type consistency:**
- `__headline` is the editor-only key throughout Tasks 2/3.
- `splitToEditorShape` / `joinFromEditorShape` named consistently in factory and the page mutate hooks.
- `eventStatusLabel()` (PHP camelCase method) → `event_status_label` (snake_case payload key, JSON-default Laravel transform) → `summit.eventStatusLabel` (camelCase in TS, after Next.js normalization). Task 7 step assumes the existing payload normalization layer handles this; if the payload reaches Next.js as `event_status_label`, update the Task 7 reference accordingly when the worker hits it.

**Decisions baked in:**
- Headline rich-text uses `<em>` only (no `<strong>` etc.) to match how the renderer styles the accent.
- Empty `accent` is allowed (Zod schemas relaxed to `.optional()`).
- Date ranges formatted in PHP using locale-en (`F`, `M`, `j`); Carbon's default locale is fine for the assertions.
- The `page_overrides.sections` column is **left in place** in the DB. Old data renders today via existing skin code; new data won't be written. Cleanup deferred until the global design panel ships.
