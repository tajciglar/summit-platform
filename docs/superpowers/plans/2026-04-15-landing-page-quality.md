# Landing Page Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-architect landing-page generation around a per-summit Style Brief plus a two-stage (image → code) per-section pipeline, so generated pages match the curated `docs/block-references/*.png` quality and approach `parenting-summits.com` fidelity.

**Architecture:** Phase 0 builds a summit-level JSON `style_brief` from a reference URL screenshot (via Playwright + Gemini vision). Phase 1 generates each section by first producing a 1440×900 mockup PNG (`gemini-3.1-flash-image-preview`), then implementing it as JSX (`gemini-2.5-flash`). Laravel orchestrates jobs and UI; Next.js is a stateless service for Playwright + Gemini + validation + render.

**Tech Stack:** Laravel 13, Filament v4, PHP 8.3, Next.js 16.2, React 19, `@google/genai`, Playwright 1.59, PostgreSQL 16 jsonb, Redis queue.

**Spec:** `docs/superpowers/specs/2026-04-15-landing-page-quality-design.md`

---

## File Structure

### New files

| Path | Responsibility |
|---|---|
| `database/migrations/2026_04_15_140000_add_style_brief_to_summits.php` | +`style_reference_url`, +`style_brief` jsonb, +`style_brief_built_at`, +`style_brief_status` |
| `database/migrations/2026_04_15_140100_add_style_brief_override_to_funnels.php` | +`style_brief_override` jsonb, +`last_section_selection` jsonb |
| `database/migrations/2026_04_15_140300_move_style_reference_from_batches.php` | Backfill summit URL from legacy `landing_page_batches.style_reference`, then drop column |
| `app/Services/StyleBrief/StyleBriefResolver.php` | Deep-merges summit base + funnel override; returns fully-resolved brief for generation |
| `app/Services/StyleBrief/DefaultStyleBrief.php` | Returns a safe default brief (Plus Jakarta Sans + Inter + purple + pill) used when none exists |
| `app/Services/StyleBrief/StyleBriefClient.php` | HTTP client → Next.js `/api/style-briefs/build`; returns `{status, brief, reference_path, error?}` |
| `app/Jobs/BuildStyleBriefJob.php` | Queue job: flips status `building` → calls client → saves `style_brief` + `reference.png` path → status `ready` / `failed` |
| `app/Filament/Resources/Summits/Pages/EditSummitStyleBrief.php` | Custom Filament page at `/admin/summits/{id}/style-brief` with palette/typography editor + lock-fields |
| `resources/views/filament/resources/summits/pages/edit-summit-style-brief.blade.php` | Blade view for the editor page |
| `app/Jobs/PruneMockupsJob.php` | Daily job: deletes mockup PNGs for drafts rejected > 7 days |
| `tests/Unit/StyleBriefResolverTest.php` | Pure-unit tests for resolver (deep merge + lock fields) |
| `tests/Feature/BuildStyleBriefJobTest.php` | Feature: Http::fake() Next.js, assert persistence + status transitions |
| `tests/Feature/StyleBriefEditorTest.php` | Feature: save/regen/lock-fields via Filament Livewire actions |
| `tests/Feature/GenerateFormSectionSelectionTest.php` | Feature: section-selection grid persisted + dispatched with `allowed_types` |
| `next-app/src/app/api/style-briefs/build/route.ts` | POST: URL + summitContext → screenshot via Playwright → Gemini vision → brief JSON |
| `next-app/src/app/api/sections/design-image/route.ts` | POST: brief + referenceScreenshot + section → Gemini Image → base64 PNG |
| `next-app/src/lib/blocks/playwright-service.ts` | `screenshotUrl(url)` — launches chromium, 1440x900, returns base64 PNG + captures font families |
| `next-app/src/lib/blocks/vision-brief-extractor.ts` | `extractBriefFromScreenshot(png, summitContext)` — gemini vision → Style Brief JSON |
| `next-app/src/lib/blocks/image-stage.ts` | `designSectionImage(input)` — wraps Gemini image preview call |
| `next-app/scripts/lib/style-brief-defaults.ts` | Shared default brief (TS mirror of PHP default for parsers) |
| `next-app/tests/unit/style-brief-schema.test.ts` | Zod validator for brief JSON |
| `next-app/tests/unit/vision-brief-extractor.test.ts` | Mocked Gemini call → assert extraction shape |
| `next-app/tests/unit/image-stage.test.ts` | Mocked Gemini image call → assert base64 PNG return |
| `next-app/tests/e2e/landing-page-flow.spec.ts` | Playwright end-to-end: login → build brief → generate → preview |

### Modified files

| Path | Change |
|---|---|
| `app/Models/Summit.php` | +fillable[`style_reference_url`], +casts[`style_brief`, `style_brief_built_at`], +helper `resolveStyleBrief()` |
| `app/Models/Funnel.php` | +fillable[`style_brief_override`, `last_section_selection`], +casts |
| `app/Models/LandingPageBatch.php` | Remove `style_reference` from `$fillable` (column dropped) |
| `app/Services/LandingPageGenerator.php` | Inject `StyleBriefResolver`; pass `style_brief` + `reference_path` + `allowed_types` into phases |
| `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php` | Two-stage per section: Stage 1 image call; save PNG to disk; pass mockup_url to Stage 2 |
| `app/Services/FunnelGenerator/Phases/ArchitectPhase.php` | Signature `run(..., ?array $allowedTypes = null)`; pass to ToolBuilder |
| `app/Services/FunnelGenerator/Tools/ToolBuilder.php` | `architectTool(..., ?array $allowedTypes)` filters enum |
| `app/Jobs/GenerateLandingPageVersionJob.php` | Pull `style_brief` via resolver; pass `allowed_types` + `section_override_url`; timeout bumped to 420s (two Gemini calls × N sections × retries) |
| `app/Jobs/RegenerateSectionJob.php` | Runs Stage 1 then Stage 2; preserve operator-edited field values |
| `app/Filament/Resources/Summits/SummitResource.php` | Form: +Section "Style" with `style_reference_url` TextInput + "Build Style Brief" button |
| `app/Filament/Resources/Summits/Pages/EditSummit.php` | +Action "Edit Style Brief" linking to custom page |
| `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php` | Generate form: +section-selection CheckboxList, +preflight check on `summit.style_brief_status`, persists `funnel.last_section_selection` |
| `resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php` | +`View mockup` link per section row, +image_failed/render_failed badges |
| `app/Http/Controllers/Api/LandingPageDraftController.php` | Include `mockup_url` in the sections payload returned to preview |
| `next-app/src/app/api/sections/generate/route.ts` | Accept `styleBrief`, `referenceImage`, `mockupImage`; pass to code stage |
| `next-app/src/app/api/sections/regenerate/route.ts` | Same new fields |
| `next-app/src/lib/blocks/design-phase.ts` | Accept `mockupImage` param, include in Gemini multimodal input |
| `next-app/src/lib/blocks/design-prompt.ts` | When `mockupImage` provided, use it as visual anchor; drop reference PNG lookup |
| `next-app/src/lib/blocks/gemini-client.ts` | Export `callGeminiImage()` for gemini-3.1-flash-image-preview |
| `routes/console.php` | Schedule `PruneMockupsJob::class` daily |
| `.env.example` | +`GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview`, +`GEMINI_VISION_MODEL=gemini-2.5-pro`, +`NEXT_PLAYWRIGHT_CHROMIUM_PATH` (optional) |

---

## Task 1: Create migrations (summits + funnels + backfill style_reference)

**Files:**
- Create: `database/migrations/2026_04_15_140000_add_style_brief_to_summits.php`
- Create: `database/migrations/2026_04_15_140100_add_style_brief_override_to_funnels.php`
- Create: `database/migrations/2026_04_15_140300_move_style_reference_from_batches.php`

- [ ] **Step 1: Write migration for summits**

`database/migrations/2026_04_15_140000_add_style_brief_to_summits.php`:
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('summits', function (Blueprint $t) {
            $t->string('style_reference_url', 500)->nullable()->after('hero_image_url');
            $t->jsonb('style_brief')->nullable()->after('style_reference_url');
            $t->timestamp('style_brief_built_at')->nullable()->after('style_brief');
            $t->string('style_brief_status', 32)->default('absent')->after('style_brief_built_at');
        });
    }
    public function down(): void {
        Schema::table('summits', function (Blueprint $t) {
            $t->dropColumn(['style_reference_url','style_brief','style_brief_built_at','style_brief_status']);
        });
    }
};
```

- [ ] **Step 2: Write migration for funnels**

`database/migrations/2026_04_15_140100_add_style_brief_override_to_funnels.php`:
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('funnels', function (Blueprint $t) {
            $t->jsonb('style_brief_override')->nullable()->after('theme');
            $t->jsonb('last_section_selection')->nullable()->after('style_brief_override');
        });
    }
    public function down(): void {
        Schema::table('funnels', function (Blueprint $t) {
            $t->dropColumn(['style_brief_override','last_section_selection']);
        });
    }
};
```

- [ ] **Step 3: Write backfill+drop migration for batches**

`database/migrations/2026_04_15_140300_move_style_reference_from_batches.php`:
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB, Schema};

return new class extends Migration {
    public function up(): void {
        DB::statement("
            UPDATE summits s
               SET style_reference_url = b.style_reference
              FROM landing_page_batches b
             WHERE b.summit_id = s.id
               AND s.style_reference_url IS NULL
               AND b.style_reference IS NOT NULL
        ");
        Schema::table('landing_page_batches', function (Blueprint $t) {
            if (Schema::hasColumn('landing_page_batches', 'style_reference')) {
                $t->dropColumn('style_reference');
            }
        });
    }
    public function down(): void {
        Schema::table('landing_page_batches', function (Blueprint $t) {
            $t->text('style_reference')->nullable();
        });
    }
};
```

- [ ] **Step 4: Run migrations**

```bash
php artisan migrate
```
Expected: three new migrations applied successfully.

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_04_15_14* && git commit -m "feat(landing-pages): migrations for style_brief + section_selection"
```

---

## Task 2: Update Summit + Funnel + LandingPageBatch models

**Files:**
- Modify: `app/Models/Summit.php`
- Modify: `app/Models/Funnel.php`
- Modify: `app/Models/LandingPageBatch.php`

- [ ] **Step 1: Summit fillable + casts**

In `app/Models/Summit.php`, extend `$fillable` to include `'style_reference_url', 'style_brief', 'style_brief_built_at', 'style_brief_status'` and `$casts` with:
```php
'style_brief' => 'array',
'style_brief_built_at' => 'datetime',
```

- [ ] **Step 2: Funnel fillable + casts**

In `app/Models/Funnel.php`, extend `$fillable` with `'style_brief_override', 'last_section_selection'` and `$casts` with:
```php
'style_brief_override' => 'array',
'last_section_selection' => 'array',
```

- [ ] **Step 3: LandingPageBatch drop style_reference**

In `app/Models/LandingPageBatch.php`, remove `'style_reference'` from `$fillable`.

- [ ] **Step 4: Commit**

```bash
git add app/Models/ && git commit -m "feat(models): style_brief + section_selection casts/fillable"
```

---

## Task 3: DefaultStyleBrief service

**Files:**
- Create: `app/Services/StyleBrief/DefaultStyleBrief.php`

- [ ] **Step 1: Write default**

```php
<?php
namespace App\Services\StyleBrief;

class DefaultStyleBrief
{
    public static function get(): array {
        return [
            'palette' => [
                'primary' => '#5e4d9b', 'primary_text' => '#ffffff',
                'accent' => '#00b553', 'background' => '#ffffff',
                'surface' => '#f9fafb', 'text' => '#111827',
                'text_muted' => '#6b7280', 'border' => '#e5e7eb',
            ],
            'typography' => [
                'heading_font' => 'Plus Jakarta Sans', 'body_font' => 'Inter',
                'heading_weight' => 700, 'scale' => 'comfortable',
            ],
            'components' => [
                'button_shape' => 'pill', 'button_weight' => 'bold',
                'card_style' => 'elevated', 'card_radius' => 'lg',
            ],
            'rhythm' => [
                'section_padding' => 'comfortable', 'max_width' => 1200, 'density' => 'airy',
            ],
            'voice' => ['tone' => 'warm-expert', 'headline_style' => 'benefit-driven'],
            'hero_pattern' => 'split-image-right',
            '_generated_from' => null,
            '_generated_at' => null,
            '_locked_fields' => [],
        ];
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/StyleBrief/DefaultStyleBrief.php && git commit -m "feat(style-brief): default brief"
```

---

## Task 4: StyleBriefResolver with unit tests

**Files:**
- Create: `app/Services/StyleBrief/StyleBriefResolver.php`
- Create: `tests/Unit/StyleBriefResolverTest.php`

- [ ] **Step 1: Write failing test**

```php
<?php
namespace Tests\Unit;

use App\Models\Funnel;
use App\Models\Summit;
use App\Services\StyleBrief\StyleBriefResolver;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StyleBriefResolverTest extends TestCase {
    use RefreshDatabase;

    public function test_returns_default_when_summit_has_none(): void {
        $summit = Summit::factory()->create(['style_brief' => null]);
        $funnel = Funnel::factory()->for($summit)->create(['style_brief_override' => null]);
        $brief = (new StyleBriefResolver)->resolveForFunnel($funnel);
        $this->assertSame('#5e4d9b', $brief['palette']['primary']);
    }

    public function test_funnel_override_deep_merges_summit_base(): void {
        $summit = Summit::factory()->create([
            'style_brief' => ['palette' => ['primary' => '#111111']],
        ]);
        $funnel = Funnel::factory()->for($summit)->create([
            'style_brief_override' => ['palette' => ['accent' => '#22ff22']],
        ]);
        $brief = (new StyleBriefResolver)->resolveForFunnel($funnel);
        $this->assertSame('#111111', $brief['palette']['primary']);
        $this->assertSame('#22ff22', $brief['palette']['accent']);
        $this->assertSame('#ffffff', $brief['palette']['background']); // from default
    }
}
```

- [ ] **Step 2: Run test — expect failure (class not defined)**

```bash
php artisan test --filter=StyleBriefResolverTest
```

- [ ] **Step 3: Implement resolver**

```php
<?php
namespace App\Services\StyleBrief;

use App\Models\Funnel;
use Illuminate\Support\Arr;

class StyleBriefResolver
{
    public function resolveForFunnel(Funnel $funnel): array {
        $default = DefaultStyleBrief::get();
        $base = $funnel->summit?->style_brief ?? [];
        $override = $funnel->style_brief_override ?? [];
        return $this->deepMerge($this->deepMerge($default, $base), $override);
    }

    private function deepMerge(array $a, array $b): array {
        foreach ($b as $key => $value) {
            if (is_array($value) && isset($a[$key]) && is_array($a[$key]) && ! array_is_list($a[$key])) {
                $a[$key] = $this->deepMerge($a[$key], $value);
            } else {
                $a[$key] = $value;
            }
        }
        return $a;
    }
}
```

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add app/Services/StyleBrief/StyleBriefResolver.php tests/Unit/StyleBriefResolverTest.php \
  && git commit -m "feat(style-brief): resolver with deep-merge + tests"
```

---

## Task 5: Next.js Playwright screenshot service

**Files:**
- Create: `next-app/src/lib/blocks/playwright-service.ts`

- [ ] **Step 1: Write the service**

```ts
import { chromium } from 'playwright';

export interface ScreenshotResult {
  base64: string;
  mime: 'image/png';
  width: number;
  height: number;
}

export async function screenshotUrl(url: string, opts: { width?: number; height?: number; timeoutMs?: number } = {}): Promise<ScreenshotResult> {
  const { width = 1440, height = 900, timeoutMs = 30_000 } = opts;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });
    // Scroll-to-bottom to trigger lazy assets, then back to top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    return { base64: buf.toString('base64'), mime: 'image/png', width, height };
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add next-app/src/lib/blocks/playwright-service.ts \
  && git commit -m "feat(next): playwright screenshot helper"
```

---

## Task 6: Vision brief extractor

**Files:**
- Create: `next-app/src/lib/blocks/vision-brief-extractor.ts`
- Modify: `next-app/src/lib/blocks/gemini-client.ts` (add Pro vision helper)

- [ ] **Step 1: Add vision helper to gemini-client**

In `next-app/src/lib/blocks/gemini-client.ts` append:
```ts
const VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? 'gemini-2.5-pro';

export async function callGeminiVision(call: GeminiCall, attempt = 0): Promise<string> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY missing');
  const client = new GoogleGenAI({ apiKey: API_KEY });
  const parts: Array<Record<string, unknown>> = [{ text: call.text }];
  if (call.image) parts.push({ inlineData: { mimeType: call.image.mime, data: call.image.data } });
  try {
    const res = await client.models.generateContent({
      model: VISION_MODEL,
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: 'application/json' },
    });
    const text = res.text ?? '';
    if (!text) throw new Error('empty response');
    return text;
  } catch (err) {
    if (attempt < 2) {
      const delay = 500 * (attempt + 1) ** 2;
      await new Promise(r => setTimeout(r, delay));
      return callGeminiVision(call, attempt + 1);
    }
    throw err;
  }
}
```

- [ ] **Step 2: Write extractor**

```ts
import { callGeminiVision } from './gemini-client';

export interface StyleBrief {
  palette: Record<string,string>;
  typography: Record<string, unknown>;
  components: Record<string, unknown>;
  rhythm: Record<string, unknown>;
  voice: Record<string, unknown>;
  hero_pattern: string;
  _generated_from?: string | null;
  _generated_at?: string | null;
  _locked_fields?: string[];
}

export async function extractBriefFromScreenshot(pngBase64: string, summitContext: Record<string, unknown>, sourceUrl: string): Promise<StyleBrief> {
  const prompt = [
    'You are a brand-systems analyst. Given a website screenshot and optional summit context, extract a reusable Style Brief as strict JSON.',
    '',
    'Summit context:',
    JSON.stringify(summitContext, null, 2),
    '',
    'Return a JSON object with these EXACT top-level keys:',
    '- palette: { primary, primary_text, accent, background, surface, text, text_muted, border } (hex strings)',
    '- typography: { heading_font, body_font, heading_weight (number), scale: "compact"|"comfortable"|"generous" }',
    '- components: { button_shape: "pill"|"rounded"|"square", button_weight: "regular"|"bold", card_style: "flat"|"elevated"|"outlined", card_radius: "sm"|"md"|"lg"|"xl" }',
    '- rhythm: { section_padding: "tight"|"comfortable"|"airy", max_width: number (px), density: "dense"|"comfortable"|"airy" }',
    '- voice: { tone, headline_style }',
    '- hero_pattern: one of "split-image-right"|"split-image-left"|"centered"|"full-bleed-image"|"stacked-copy"',
    '',
    'Rules:',
    '- Base decisions on the screenshot first; fall back to summit context only for voice/tone hints.',
    '- Palette MUST use real hex codes observed in the screenshot when possible.',
    '- Do NOT include any other fields.',
    '- No markdown fences, no commentary.',
  ].join('\n');

  const raw = await callGeminiVision({ text: prompt, image: { mime: 'image/png', data: pngBase64 } });
  const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/```$/,'');
  const parsed = JSON.parse(trimmed) as StyleBrief;
  parsed._generated_from = sourceUrl;
  parsed._generated_at = new Date().toISOString();
  parsed._locked_fields = parsed._locked_fields ?? [];
  return parsed;
}
```

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/vision-brief-extractor.ts next-app/src/lib/blocks/gemini-client.ts \
  && git commit -m "feat(next): vision brief extractor"
```

---

## Task 7: Next.js /api/style-briefs/build route

**Files:**
- Create: `next-app/src/app/api/style-briefs/build/route.ts`

- [ ] **Step 1: Write route**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { screenshotUrl } from '@/lib/blocks/playwright-service';
import { extractBriefFromScreenshot } from '@/lib/blocks/vision-brief-extractor';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${process.env.INTERNAL_API_TOKEN}`;
  if (!process.env.INTERNAL_API_TOKEN || auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const url: string = body?.url ?? '';
  const summitContext = body?.summit_context ?? {};

  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  try {
    const shot = await screenshotUrl(url);
    const brief = await extractBriefFromScreenshot(shot.base64, summitContext, url);
    return NextResponse.json({
      status: 'ready',
      brief,
      reference_png_base64: shot.base64,
      reference_png_mime: shot.mime,
    });
  } catch (err) {
    const msg = (err as Error).message ?? 'unknown';
    if (msg.includes('timeout') || msg.includes('net::ERR')) {
      return NextResponse.json({ status: 'failed_screenshot', error: msg }, { status: 200 });
    }
    return NextResponse.json({ status: 'failed_vision', error: msg }, { status: 200 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add next-app/src/app/api/style-briefs/build/ \
  && git commit -m "feat(next): /api/style-briefs/build endpoint"
```

---

## Task 8: Laravel StyleBriefClient service

**Files:**
- Create: `app/Services/StyleBrief/StyleBriefClient.php`

- [ ] **Step 1: Implement HTTP client**

```php
<?php
namespace App\Services\StyleBrief;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\{Http, Storage};

class StyleBriefClient
{
    public function build(string $summitId, string $url, array $summitContext): array {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        /** @var Response $resp */
        $resp = Http::withToken($token)
            ->timeout(140)
            ->post("{$base}/api/style-briefs/build", [
                'url' => $url,
                'summit_context' => $summitContext,
            ]);
        if (! $resp->successful()) {
            return ['status' => 'failed_vision', 'error' => "HTTP {$resp->status()}: ".substr($resp->body(),0,240)];
        }
        $data = $resp->json();
        if (($data['status'] ?? null) === 'ready' && ! empty($data['reference_png_base64'])) {
            $path = "style-briefs/{$summitId}/reference.png";
            Storage::disk('public')->put($path, base64_decode($data['reference_png_base64']));
            $data['reference_path'] = $path;
            unset($data['reference_png_base64']);
        }
        return $data;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/StyleBrief/StyleBriefClient.php \
  && git commit -m "feat(style-brief): laravel client for Next.js"
```

---

## Task 9: BuildStyleBriefJob

**Files:**
- Create: `app/Jobs/BuildStyleBriefJob.php`
- Create: `tests/Feature/BuildStyleBriefJobTest.php`

- [ ] **Step 1: Write job**

```php
<?php
namespace App\Jobs;

use App\Models\Summit;
use App\Services\StyleBrief\StyleBriefClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class BuildStyleBriefJob implements ShouldQueue
{
    use Queueable;
    public int $timeout = 180;
    public int $tries = 1;

    public function __construct(public readonly string $summitId) {}

    public function handle(StyleBriefClient $client): void {
        /** @var Summit $summit */
        $summit = Summit::findOrFail($this->summitId);
        $summit->update(['style_brief_status' => 'building']);
        try {
            $result = $client->build(
                summitId: $this->summitId,
                url: $summit->style_reference_url ?? '',
                summitContext: $summit->buildSummitContext(),
            );
            $summit->update([
                'style_brief' => $result['brief'] ?? null,
                'style_brief_status' => $result['status'] === 'ready' ? 'ready' : 'failed',
                'style_brief_built_at' => now(),
            ]);
        } catch (Throwable $e) {
            $summit->update(['style_brief_status' => 'failed']);
            throw $e;
        }
    }
}
```

- [ ] **Step 2: Write feature test**

```php
<?php
namespace Tests\Feature;

use App\Jobs\BuildStyleBriefJob;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BuildStyleBriefJobTest extends TestCase {
    use RefreshDatabase;

    public function test_happy_path_saves_brief(): void {
        Http::fake([
            '*/api/style-briefs/build' => Http::response([
                'status' => 'ready',
                'brief' => ['palette' => ['primary' => '#abcdef']],
                'reference_png_base64' => base64_encode('fakepng'),
                'reference_png_mime' => 'image/png',
            ], 200),
        ]);
        $summit = Summit::factory()->create(['style_reference_url' => 'https://example.com']);
        (new BuildStyleBriefJob($summit->id))->handle(app(\App\Services\StyleBrief\StyleBriefClient::class));
        $summit->refresh();
        $this->assertSame('ready', $summit->style_brief_status);
        $this->assertSame('#abcdef', $summit->style_brief['palette']['primary']);
    }

    public function test_failed_screenshot_marks_failed(): void {
        Http::fake(['*/api/style-briefs/build' => Http::response(['status'=>'failed_screenshot','error'=>'timeout'], 200)]);
        $summit = Summit::factory()->create(['style_reference_url' => 'https://bad']);
        (new BuildStyleBriefJob($summit->id))->handle(app(\App\Services\StyleBrief\StyleBriefClient::class));
        $this->assertSame('failed', $summit->fresh()->style_brief_status);
    }
}
```

- [ ] **Step 3: Run tests**

```bash
php artisan test --filter=BuildStyleBriefJobTest
```

- [ ] **Step 4: Commit**

```bash
git add app/Jobs/BuildStyleBriefJob.php tests/Feature/BuildStyleBriefJobTest.php \
  && git commit -m "feat(style-brief): BuildStyleBriefJob + feature tests"
```

---

## Task 10: Filament SummitResource form + EditSummit action

**Files:**
- Modify: `app/Filament/Resources/Summits/SummitResource.php` (add `style_reference_url` TextInput field + "Build Style Brief" button)
- Modify: `app/Filament/Resources/Summits/Pages/EditSummit.php` (add "Edit Style Brief" header action)

- [ ] **Step 1: Add text input to SummitResource form**

Locate the form `schema()` in `SummitResource.php`. Add after the existing hero fields:
```php
Filament\Forms\Components\Section::make('Style')
  ->description('Drives AI-generated landing page look & feel across all funnels of this summit.')
  ->schema([
    Filament\Forms\Components\TextInput::make('style_reference_url')
      ->label('Style Reference URL')
      ->placeholder('https://parenting-summits.com')
      ->url()
      ->helperText('Used to auto-build a reusable Style Brief.'),
    Filament\Forms\Components\Placeholder::make('style_brief_status_label')
      ->label('Style Brief Status')
      ->content(fn ($record) => $record?->style_brief_status ?? 'absent'),
  ])
  ->collapsible(),
```

- [ ] **Step 2: Add Build + Edit actions to EditSummit**

Insert into `getHeaderActions()` of `EditSummit.php`:
```php
\Filament\Actions\Action::make('buildStyleBrief')
  ->label('Build Style Brief')
  ->icon('heroicon-o-sparkles')
  ->color('primary')
  ->visible(fn () => filled($this->getRecord()->style_reference_url))
  ->action(function (): void {
    \App\Jobs\BuildStyleBriefJob::dispatch($this->getRecord()->id);
    \Filament\Notifications\Notification::make()
      ->title('Building style brief — refresh in ~30s')
      ->success()->send();
  }),
\Filament\Actions\Action::make('editStyleBrief')
  ->label('Edit Style Brief')
  ->icon('heroicon-o-pencil-square')
  ->color('gray')
  ->visible(fn () => $this->getRecord()->style_brief_status === 'ready')
  ->url(fn () => route('filament.admin.resources.summits.style-brief', ['record' => $this->getRecord()])),
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Resources/Summits/ \
  && git commit -m "feat(filament): summit style reference URL + Build action"
```

---

## Task 11: Style Brief editor page

**Files:**
- Create: `app/Filament/Resources/Summits/Pages/EditSummitStyleBrief.php`
- Create: `resources/views/filament/resources/summits/pages/edit-summit-style-brief.blade.php`
- Modify: `app/Filament/Resources/Summits/SummitResource.php` (register custom page)

- [ ] **Step 1: Create page class**

```php
<?php
namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use App\Jobs\BuildStyleBriefJob;
use App\Models\Summit;
use App\Services\StyleBrief\DefaultStyleBrief;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;

class EditSummitStyleBrief extends Page
{
    protected static string $resource = SummitResource::class;
    protected string $view = 'filament.resources.summits.pages.edit-summit-style-brief';
    protected static ?string $title = 'Style Brief';

    public Summit $record;
    public array $brief = [];
    public array $locked = [];

    public function mount(Summit $record): void {
        $this->record = $record;
        $this->brief = $record->style_brief ?? DefaultStyleBrief::get();
        $this->locked = $this->brief['_locked_fields'] ?? [];
    }

    public function save(): void {
        $this->brief['_locked_fields'] = array_values(array_unique($this->locked));
        $this->record->update(['style_brief' => $this->brief]);
        Notification::make()->title('Brief saved.')->success()->send();
    }

    public function regenerateFromUrl(): void {
        BuildStyleBriefJob::dispatch($this->record->id);
        Notification::make()->title('Rebuilding from URL — refresh shortly.')->success()->send();
    }

    public function resetBrief(): void {
        $this->brief = $this->record->style_brief ?? DefaultStyleBrief::get();
        $this->locked = $this->brief['_locked_fields'] ?? [];
        Notification::make()->title('Reset to saved.')->send();
    }

    protected function getHeaderActions(): array {
        return [
            Action::make('save')->label('Save')->color('primary')->action('save'),
            Action::make('regenerateFromUrl')->label('Regenerate from URL')->color('warning')->requiresConfirmation()->action('regenerateFromUrl'),
            Action::make('reset')->label('Reset')->color('gray')->action('resetBrief'),
        ];
    }
}
```

- [ ] **Step 2: Create blade view**

```blade
<x-filament-panels::page>
  <form wire:submit.prevent="save" class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <x-filament::section heading="Palette">
          @foreach (['primary','primary_text','accent','background','surface','text','text_muted','border'] as $key)
            <label class="flex items-center gap-3 my-1">
              <input type="color" wire:model.defer="brief.palette.{{ $key }}" class="h-8 w-12 rounded" />
              <span class="text-sm w-28">{{ $key }}</span>
              <input type="text" wire:model.defer="brief.palette.{{ $key }}" class="fi-input flex-1 text-xs" />
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" wire:model.defer="locked" value="palette.{{ $key }}" /> lock
              </label>
            </label>
          @endforeach
        </x-filament::section>
      </div>
      <div>
        <x-filament::section heading="Typography">
          <label class="block text-sm">Heading font
            <input wire:model.defer="brief.typography.heading_font" class="fi-input w-full" />
          </label>
          <label class="block text-sm mt-2">Body font
            <input wire:model.defer="brief.typography.body_font" class="fi-input w-full" />
          </label>
          <label class="block text-sm mt-2">Heading weight
            <input type="number" wire:model.defer="brief.typography.heading_weight" class="fi-input w-full" />
          </label>
        </x-filament::section>

        <x-filament::section heading="Components" class="mt-4">
          <label class="block text-sm">Button shape
            <select wire:model.defer="brief.components.button_shape" class="fi-input w-full">
              <option>pill</option><option>rounded</option><option>square</option>
            </select>
          </label>
          <label class="block text-sm mt-2">Card style
            <select wire:model.defer="brief.components.card_style" class="fi-input w-full">
              <option>flat</option><option>elevated</option><option>outlined</option>
            </select>
          </label>
        </x-filament::section>

        <x-filament::section heading="Hero pattern" class="mt-4">
          <select wire:model.defer="brief.hero_pattern" class="fi-input w-full">
            <option>split-image-right</option>
            <option>split-image-left</option>
            <option>centered</option>
            <option>full-bleed-image</option>
            <option>stacked-copy</option>
          </select>
        </x-filament::section>
      </div>
    </div>
  </form>
</x-filament-panels::page>
```

- [ ] **Step 3: Register in SummitResource**

Add to `SummitResource::getPages()`:
```php
'style-brief' => \App\Filament\Resources\Summits\Pages\EditSummitStyleBrief::route('/{record}/style-brief'),
```

- [ ] **Step 4: Commit**

```bash
git add app/Filament/Resources/Summits/Pages/EditSummitStyleBrief.php \
        resources/views/filament/resources/summits/pages/edit-summit-style-brief.blade.php \
        app/Filament/Resources/Summits/SummitResource.php \
  && git commit -m "feat(filament): style brief editor page"
```

---

## Task 12: Stage 1 image endpoint

**Files:**
- Create: `next-app/src/lib/blocks/image-stage.ts`
- Create: `next-app/src/app/api/sections/design-image/route.ts`
- Modify: `next-app/src/lib/blocks/gemini-client.ts` (add `callGeminiImage`)

- [ ] **Step 1: Add image client**

Append to `next-app/src/lib/blocks/gemini-client.ts`:
```ts
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3.1-flash-image-preview';

export interface GeminiImageResult { mime: string; base64: string }

export async function callGeminiImage(text: string, referenceImages: GeminiImage[] = [], attempt = 0): Promise<GeminiImageResult> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY missing');
  const client = new GoogleGenAI({ apiKey: API_KEY });
  const parts: Array<Record<string, unknown>> = [{ text }];
  for (const img of referenceImages) parts.push({ inlineData: { mimeType: img.mime, data: img.data } });
  try {
    const res = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts }],
      // Image-preview models return inline image parts; no responseMimeType.
    });
    const candidates = (res as unknown as { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }> }).candidates ?? [];
    for (const c of candidates) {
      for (const p of (c.content?.parts ?? [])) {
        if (p.inlineData?.data) {
          return { mime: p.inlineData.mimeType ?? 'image/png', base64: p.inlineData.data };
        }
      }
    }
    throw new Error('no image in gemini response');
  } catch (err) {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 500 * (attempt + 1) ** 2));
      return callGeminiImage(text, referenceImages, attempt + 1);
    }
    throw err;
  }
}
```

- [ ] **Step 2: Write image stage**

```ts
// next-app/src/lib/blocks/image-stage.ts
import { callGeminiImage, type GeminiImageResult } from './gemini-client';
import type { StyleBrief } from './vision-brief-extractor';
import type { SectionBrief, SummitContext } from './design-prompt';

export interface ImageStageInput {
  section: SectionBrief;
  summit: SummitContext;
  styleBrief: StyleBrief;
  referenceImage?: { mime: string; data: string } | null;
}

export async function designSectionImage(input: ImageStageInput): Promise<GeminiImageResult> {
  const prompt = [
    `Design ONE landing-page section mockup as a single 1440x900 PNG.`,
    ``,
    `Section: ${input.section.type} — ${input.section.purpose || 'n/a'} (position ${input.section.position} of ${input.section.total}).`,
    ``,
    `Style Brief:`,
    JSON.stringify(input.styleBrief, null, 2),
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
    ``,
    `Match the visual style (palette, typography, density, button shape, hero pattern) of the reference screenshot if provided.`,
    `Use the Style Brief for exact colors. Do NOT add watermarks, do NOT crop.`,
    `Output: one PNG, 1440x900.`,
  ].join('\n');
  const refs = input.referenceImage ? [input.referenceImage] : [];
  return callGeminiImage(prompt, refs);
}
```

- [ ] **Step 3: Write API route**

```ts
// next-app/src/app/api/sections/design-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { designSectionImage } from '@/lib/blocks/image-stage';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.INTERNAL_API_TOKEN}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  try {
    const out = await designSectionImage(body);
    return NextResponse.json({ status: 'ok', mime: out.mime, base64: out.base64 });
  } catch (err) {
    return NextResponse.json({ status: 'image_failed', error: (err as Error).message }, { status: 200 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/blocks/image-stage.ts next-app/src/lib/blocks/gemini-client.ts next-app/src/app/api/sections/design-image/ \
  && git commit -m "feat(next): /api/sections/design-image Stage 1 endpoint"
```

---

## Task 13: Stage 2 design-prompt + design-phase accept mockup + styleBrief

**Files:**
- Modify: `next-app/src/lib/blocks/design-prompt.ts`
- Modify: `next-app/src/lib/blocks/design-phase.ts`
- Modify: `next-app/src/app/api/sections/generate/route.ts`
- Modify: `next-app/src/app/api/sections/regenerate/route.ts`

- [ ] **Step 1: Extend design-prompt input + prefer mockup**

Edit `BuildDesignPromptInput`:
```ts
export interface BuildDesignPromptInput {
  section: SectionBrief;
  summit: SummitContext;
  previousSectionJsx: string | null;
  regenerationNote: string | null;
  currentJsx?: string;
  styleBrief?: Record<string, unknown>;
  mockupImage?: { mime: string; data: string } | null;   // Stage 1 output
  referenceImage?: { mime: string; data: string } | null; // fallback if Stage 1 failed
}
```

Inside `buildDesignPrompt`, replace the per-type reference lookup with:
```ts
const anchor = input.mockupImage ?? input.referenceImage ?? null;
```
And prepend Style Brief block when present:
```ts
input.styleBrief ? `=== Style Brief ===\n${JSON.stringify(input.styleBrief, null, 2)}` : '',
```
Adjust the prompt intro:
```ts
`You are an expert React + Tailwind v4 developer. Implement the provided mockup PNG as a single React component. Match colors, spacing, typography, icon shapes and layout EXACTLY.`,
```
Return `anchor ? { text, image: anchor } : { text };`.

- [ ] **Step 2: Thread new fields through design-phase**

In `designSection()`, pass `styleBrief`, `mockupImage`, `referenceImage` through `buildDesignPrompt`. No other change.

- [ ] **Step 3: Accept mockup/brief in generate route**

`next-app/src/app/api/sections/generate/route.ts`:
```ts
const out = await designSection({
  section: body.section,
  summit: body.summit,
  previousSectionJsx: body.previousSectionJsx ?? null,
  regenerationNote: body.regenerationNote ?? null,
  styleBrief: body.styleBrief ?? undefined,
  mockupImage: body.mockupImage ?? null,
  referenceImage: body.referenceImage ?? null,
});
```
Mirror in regenerate route.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/blocks/design-prompt.ts next-app/src/lib/blocks/design-phase.ts next-app/src/app/api/sections/{generate,regenerate}/route.ts \
  && git commit -m "feat(next): Stage 2 accepts mockup + styleBrief"
```

---

## Task 14: Laravel BlockDesignPhase — run Stage 1 then Stage 2 + persist mockup

**Files:**
- Modify: `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php`

- [ ] **Step 1: Rewrite `run()` as two-stage**

```php
public function run(array $sectionBriefs, array $summitContext, array $styleBrief, ?string $referencePath, string $draftId): array {
    $base = rtrim(config('services.next_app.url'), '/');
    $token = config('services.next_app.token');
    $refImage = $this->loadImage($referencePath);

    // Stage 1: image mockups in parallel
    $imageResponses = Http::pool(function ($pool) use ($sectionBriefs, $summitContext, $styleBrief, $refImage, $base, $token) {
        $out = [];
        foreach ($sectionBriefs as $i => $brief) {
            $out[] = $pool->as("img_{$i}")
                ->withToken($token)->timeout(140)
                ->post("{$base}/api/sections/design-image", [
                    'section' => $brief,
                    'summit' => $summitContext,
                    'styleBrief' => $styleBrief,
                    'referenceImage' => $refImage,
                ]);
        }
        return $out;
    });

    // Save PNGs, build mockup list
    $mockups = [];
    foreach ($sectionBriefs as $i => $brief) {
        $resp = $imageResponses["img_{$i}"] ?? null;
        if ($resp instanceof \Throwable || ! $resp?->successful() || ($resp->json('status') !== 'ok')) {
            $mockups[$i] = ['image' => null, 'url' => null];
            continue;
        }
        $mime = $resp->json('mime');
        $data = $resp->json('base64');
        $sectionId = (string) \Illuminate\Support\Str::uuid();
        $path = "draft-mockups/{$draftId}/{$sectionId}.png";
        \Illuminate\Support\Facades\Storage::disk('public')->put($path, base64_decode($data));
        $mockups[$i] = ['id' => $sectionId, 'image' => ['mime' => $mime, 'data' => $data], 'url' => '/storage/'.$path];
    }

    // Stage 2: code gen per section in parallel, seeded with mockup (or fallback to reference)
    $codeResponses = Http::pool(function ($pool) use ($sectionBriefs, $summitContext, $styleBrief, $mockups, $refImage, $base, $token) {
        $out = [];
        foreach ($sectionBriefs as $i => $brief) {
            $payload = [
                'section' => $brief,
                'summit' => $summitContext,
                'previousSectionJsx' => null,
                'styleBrief' => $styleBrief,
                'mockupImage' => $mockups[$i]['image'] ?? null,
                'referenceImage' => ($mockups[$i]['image'] ?? null) ? null : $refImage,
            ];
            $out[] = $pool->as("code_{$i}")->withToken($token)->timeout(180)
                ->post("{$base}/api/sections/generate", $payload);
        }
        return $out;
    });

    // Stitch results
    $sections = [];
    foreach ($sectionBriefs as $i => $brief) {
        $resp = $codeResponses["code_{$i}"] ?? null;
        if ($resp instanceof \Throwable || ! $resp?->successful()) {
            $stub = $this->failedStub($brief['type'], $resp instanceof \Throwable ? $resp->getMessage() : ("HTTP ".$resp?->status()));
            $stub['status'] = empty($mockups[$i]['image']) ? 'image_failed' : 'failed';
            $stub['mockup_url'] = $mockups[$i]['url'];
            $sections[] = $stub;
            continue;
        }
        $section = $resp->json();
        $section['mockup_url'] = $mockups[$i]['url'];
        if (empty($mockups[$i]['image']) && ($section['status'] ?? null) !== 'failed') {
            // Stage 1 failed but Stage 2 recovered from fallback; mark so the UI flags it.
            $section['status'] = $section['status'] ?? 'ready';
            $section['image_fallback'] = true;
        }
        $sections[] = $section;
    }
    return $sections;
}

private function loadImage(?string $path): ?array {
    if (! $path) return null;
    $full = storage_path('app/public/'.ltrim($path, '/'));
    if (! is_file($full)) return null;
    return ['mime' => 'image/png', 'data' => base64_encode(file_get_contents($full))];
}
```

Keep existing `regenerate()` unchanged for now (Task 17 replaces it).

- [ ] **Step 2: Commit**

```bash
git add app/Services/FunnelGenerator/Phases/BlockDesignPhase.php \
  && git commit -m "feat(block-design): two-stage image→code pipeline with mockup persistence"
```

---

## Task 15: Wire LandingPageGenerator + GenerateLandingPageVersionJob

**Files:**
- Modify: `app/Services/LandingPageGenerator.php`
- Modify: `app/Jobs/GenerateLandingPageVersionJob.php`

- [ ] **Step 1: Extend LandingPageGenerator.generateSections**

```php
public function generateSections(Summit $summit, ?Funnel $funnel, string $notes = '', ?string $styleOverrideUrl = null, ?array $allowedTypes = null, string $draftId = ''): array {
    $brief   = $this->buildBrief($summit, $notes, $styleOverrideUrl);
    $catalog = $this->catalogService->current();

    $sequence = $this->architect->run($brief, $catalog, ['optin'], $allowedTypes);
    $names    = $sequence['optin'] ?? [];
    $total    = count($names);
    $sectionBriefs = [];
    foreach ($names as $i => $name) {
        $sectionBriefs[] = ['type' => $name, 'purpose' => '', 'position' => $i + 1, 'total' => $total];
    }

    $context = $summit->buildSummitContext();
    if (! empty($styleOverrideUrl)) $context['style_reference_url'] = $styleOverrideUrl;

    $styleBrief = $this->styleBriefResolver->resolveForFunnel($funnel ?? $summit->funnels->first() ?? new Funnel(['summit_id' => $summit->id]));
    $referencePath = "style-briefs/{$summit->id}/reference.png";
    if (! \Illuminate\Support\Facades\Storage::disk('public')->exists($referencePath)) $referencePath = null;

    return $this->blockDesignPhase->run(
        sectionBriefs: $sectionBriefs,
        summitContext: $context,
        styleBrief: $styleBrief,
        referencePath: $referencePath,
        draftId: $draftId,
    );
}
```

Inject `StyleBriefResolver` via constructor.

- [ ] **Step 2: Update Job to pass funnel + draft id + allowed types**

```php
public function handle(LandingPageGenerator $generator): void {
    $this->draft->update(['status' => 'generating']);
    try {
        $summit   = $this->draft->batch->summit;
        $funnel   = $this->draft->batch->funnel;
        $notes    = $this->draft->batch->notes ?? '';
        $override = $this->draft->batch->style_override_url ?? null;
        $allowed  = $this->draft->batch->allowed_types ?? null; // see Task 16

        if (config('features.runtime_gemini_gen')) {
            $sections = $generator->generateSections($summit, $funnel, $notes, $override, $allowed, (string) $this->draft->id);
            $this->draft->update(['sections' => $sections, 'status' => 'ready']);
        } else {
            $blocks = $generator->generate($summit, $notes, $override);
            $this->draft->update(['blocks' => $blocks, 'status' => 'ready']);
        }
    } catch (Throwable $e) {
        $this->draft->update(['status' => 'failed', 'error_message' => substr($e->getMessage(), 0, 500)]);
        throw $e;
    }
}
public int $timeout = 420;
```

- [ ] **Step 3: Commit**

```bash
git add app/Services/LandingPageGenerator.php app/Jobs/GenerateLandingPageVersionJob.php \
  && git commit -m "feat(landing-pages): generator + job wire style brief + allowed types"
```

---

## Task 16: ArchitectPhase allowedTypes + ToolBuilder filter

**Files:**
- Modify: `app/Services/FunnelGenerator/Tools/ToolBuilder.php`
- Modify: `app/Services/FunnelGenerator/Phases/ArchitectPhase.php`

- [ ] **Step 1: Filter ToolBuilder enum by `$allowedTypes`**

```php
public function architectTool(array $catalog, array $stepTypes, ?array $allowedTypes = null): array {
    $properties = [];
    foreach ($stepTypes as $stepType) {
        $enum = array_values(array_map(
            fn ($b) => $b['type'],
            array_filter(
                $catalog['blocks'] ?? [],
                fn ($b) => in_array($stepType, $b['validOn'] ?? [], true)
                          && ($allowedTypes === null || in_array($b['type'], $allowedTypes, true)),
            ),
        ));
        $properties[$stepType] = [
            'type' => 'array', 'minItems' => 0,
            'items' => ['type' => 'string', 'enum' => $enum],
            'description' => "Ordered list of block types for the {$stepType} step.",
        ];
    }
    return [
        'name' => 'architect_funnel',
        'description' => 'Emit the block sequence for a complete funnel.',
        'input_schema' => ['type' => 'object', 'properties' => $properties, 'required' => $stepTypes],
    ];
}
```

- [ ] **Step 2: Extend ArchitectPhase signature**

```php
public function run(array $brief, array $catalog, array $stepTypes, ?array $allowedTypes = null): array {
    $tool = $this->toolBuilder->architectTool($catalog, $stepTypes, $allowedTypes);
    // ... rest unchanged
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Services/FunnelGenerator/ \
  && git commit -m "feat(architect): optional allowedTypes filter"
```

---

## Task 17: Generate form upgrade — section CheckboxList + style override URL

**Files:**
- Modify: `app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php`
- Modify: `app/Models/LandingPageBatch.php` (add transient columns)
- Create migration: `database/migrations/2026_04_15_140400_add_allowed_types_and_override_url_to_batches.php`

- [ ] **Step 1: Migration for new batch columns**

```php
Schema::table('landing_page_batches', function (Blueprint $t) {
    $t->jsonb('allowed_types')->nullable()->after('notes');
    $t->string('style_override_url', 500)->nullable()->after('allowed_types');
});
```

- [ ] **Step 2: Extend model fillable**

Add `'allowed_types', 'style_override_url'` to `LandingPageBatch::$fillable` and cast `'allowed_types' => 'array'`.

- [ ] **Step 3: Upgrade the Generate form**

Replace the action in `ManageLandingPageBatches::getHeaderActions()`:
```php
Action::make('generateLandingPages')
    ->label('Generate Landing Pages')
    ->icon('heroicon-o-sparkles')->color('primary')
    ->visible(fn () => true)
    ->disabled(fn () => ($this->record->summit->style_brief_status ?? 'absent') !== 'ready')
    ->tooltip(fn () => ($this->record->summit->style_brief_status ?? 'absent') !== 'ready' ? 'Build the summit style brief first.' : null)
    ->form(function () {
        $catalog = app(\App\Services\Blocks\BlockCatalogService::class)->current();
        $options = collect($catalog['blocks'] ?? [])
            ->filter(fn ($b) => in_array('optin', $b['validOn'] ?? [], true))
            ->mapWithKeys(fn ($b) => [$b['type'] => "{$b['type']} — ".($b['purpose'] ?? '')])
            ->toArray();
        $default = $this->record->last_section_selection ?: array_keys($options);
        return [
            TextInput::make('version_count')->label('Number of Versions')->numeric()->integer()->minValue(1)->maxValue(10)->default(3)->required(),
            \Filament\Forms\Components\CheckboxList::make('allowed_types')
                ->label('Sections to include')
                ->options($options)->columns(2)->default($default)
                ->minItems(4)
                ->hint('Uncheck sections you do not want Gemini to generate.')
                ->required(),
            TextInput::make('style_override_url')->label('Style override URL (optional, this batch only)')->url(),
            Textarea::make('notes')->label('Creative Notes (optional)')->rows(3),
        ];
    })
    ->action(function (array $data): void {
        // persist operator preference for next time
        $this->record->update(['last_section_selection' => $data['allowed_types'] ?? []]);
        $batch = LandingPageBatch::create([
            'summit_id' => $this->record->summit_id,
            'funnel_id' => $this->record->id,
            'version_count' => (int) $data['version_count'],
            'status' => 'queued',
            'notes' => $data['notes'] ?? null,
            'allowed_types' => $data['allowed_types'] ?? null,
            'style_override_url' => $data['style_override_url'] ?? null,
        ]);
        dispatch(new GenerateLandingPageBatchJob($batch));
    }),
```

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_15_140400_* app/Models/LandingPageBatch.php app/Filament/Resources/Funnels/Pages/ManageLandingPageBatches.php \
  && git commit -m "feat(filament): section selection + per-batch style override + style-brief preflight"
```

---

## Task 18: Per-section regen via both stages + preserve edited fields

**Files:**
- Modify: `app/Jobs/RegenerateSectionJob.php`
- Modify: `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php` (add `regenerate()` two-stage)

- [ ] **Step 1: Rewrite BlockDesignPhase::regenerate**

```php
public function regenerate(array $currentSection, array $summitContext, array $styleBrief, ?string $referencePath, string $draftId, ?string $note): array {
    $base = rtrim(config('services.next_app.url'), '/');
    $token = config('services.next_app.token');
    $refImage = $this->loadImage($referencePath);
    $sectionBrief = ['type' => $currentSection['type'], 'purpose' => '', 'position' => 0, 'total' => 0];

    // Stage 1
    $imgResp = Http::withToken($token)->timeout(140)
        ->post("{$base}/api/sections/design-image", [
            'section' => $sectionBrief, 'summit' => $summitContext,
            'styleBrief' => $styleBrief, 'referenceImage' => $refImage,
        ]);
    $mockupImage = null; $mockupUrl = null;
    if ($imgResp->successful() && $imgResp->json('status') === 'ok') {
        $mockupImage = ['mime' => $imgResp->json('mime'), 'data' => $imgResp->json('base64')];
        $path = "draft-mockups/{$draftId}/{$currentSection['id']}.png";
        \Illuminate\Support\Facades\Storage::disk('public')->put($path, base64_decode($imgResp->json('base64')));
        $mockupUrl = '/storage/'.$path;
    }

    // Stage 2
    $resp = Http::withToken($token)->timeout(180)->post("{$base}/api/sections/regenerate", [
        'section' => $sectionBrief,
        'summit' => $summitContext,
        'styleBrief' => $styleBrief,
        'mockupImage' => $mockupImage,
        'referenceImage' => $mockupImage ? null : $refImage,
        'currentJsx' => $currentSection['jsx'] ?? null,
        'regenerationNote' => $note,
        'preserveId' => $currentSection['id'],
    ]);
    if (! $resp->successful()) return $this->failedStub($currentSection['type'], "HTTP {$resp->status()}", $currentSection['id']);
    $section = $resp->json();
    $section['mockup_url'] = $mockupUrl ?? ($currentSection['mockup_url'] ?? null);
    return $section;
}
```

- [ ] **Step 2: Wire RegenerateSectionJob through styleBrief + reference + preserve fields**

In `handle()`:
```php
$draft = LandingPageDraft::with('batch.funnel.summit')->findOrFail($this->draftId);
$section = collect($draft->sections)->firstWhere('id', $this->sectionId);
if (! $section) return;

$summit = $draft->batch->summit;
$funnel = $draft->batch->funnel;
$context = $summit->buildSummitContext();
$styleBrief = app(\App\Services\StyleBrief\StyleBriefResolver::class)->resolveForFunnel($funnel);
$referencePath = "style-briefs/{$summit->id}/reference.png";
if (! \Illuminate\Support\Facades\Storage::disk('public')->exists($referencePath)) $referencePath = null;

$regen = app(\App\Services\FunnelGenerator\Phases\BlockDesignPhase::class)
    ->regenerate($section, $context, $styleBrief, $referencePath, (string) $draft->id, $this->note);

// Preserve operator-edited field values by path
$editedValues = collect($section['fields'] ?? [])->mapWithKeys(fn ($f) => [($f['path'] ?? '') => $f['value'] ?? null])->all();
if (! empty($regen['fields'])) {
    $regen['fields'] = array_map(function ($f) use ($editedValues) {
        if (isset($editedValues[$f['path']]) && $editedValues[$f['path']] !== null) {
            $f['value'] = $editedValues[$f['path']];
        }
        return $f;
    }, $regen['fields']);
}

$sections = array_map(fn ($s) => ($s['id'] === $this->sectionId) ? $regen : $s, $draft->sections);
$draft->update(['sections' => $sections]);
```

- [ ] **Step 3: Commit**

```bash
git add app/Services/FunnelGenerator/Phases/BlockDesignPhase.php app/Jobs/RegenerateSectionJob.php \
  && git commit -m "feat(regen): two-stage regen + preserve edited fields"
```

---

## Task 19: Mockup preview link + status badges in editor view

**Files:**
- Modify: `resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php`

- [ ] **Step 1: Add per-section "View mockup" link + new badges**

In the sections loop, inject after the existing status badge:
```blade
@if (! empty($section['mockup_url']))
  <a href="{{ url($section['mockup_url']) }}" target="_blank" class="text-xs text-primary-600 hover:underline ml-2">View mockup</a>
@endif

@if (($section['status'] ?? null) === 'image_failed')
  <span class="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">image failed</span>
@elseif (($section['status'] ?? null) === 'render_failed')
  <span class="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">render failed</span>
@endif
```

- [ ] **Step 2: Commit**

```bash
git add resources/views/filament/resources/funnels/pages/manage-landing-page-batches.blade.php \
  && git commit -m "feat(filament): mockup preview link + new failure badges"
```

---

## Task 20: PruneMockupsJob + schedule

**Files:**
- Create: `app/Jobs/PruneMockupsJob.php`
- Modify: `routes/console.php`

- [ ] **Step 1: Write job**

```php
<?php
namespace App\Jobs;

use App\Models\LandingPageDraft;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class PruneMockupsJob implements ShouldQueue
{
    use Queueable;
    public function handle(): void {
        $cutoff = Carbon::now()->subDays(7);
        $drafts = LandingPageDraft::where('status', 'rejected')->where('updated_at', '<', $cutoff)->get(['id']);
        foreach ($drafts as $draft) {
            $dir = "draft-mockups/{$draft->id}";
            if (Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->deleteDirectory($dir);
            }
        }
    }
}
```

- [ ] **Step 2: Schedule in routes/console.php**

Append:
```php
\Illuminate\Support\Facades\Schedule::job(new \App\Jobs\PruneMockupsJob)->daily();
```

- [ ] **Step 3: Commit**

```bash
git add app/Jobs/PruneMockupsJob.php routes/console.php \
  && git commit -m "feat(cron): daily mockup prune"
```

---

## Task 21: Run migrations + symlink storage + run queue

**Files:** (no code changes)

- [ ] **Step 1: Symlink public storage**

```bash
php artisan storage:link
```

- [ ] **Step 2: Run migrations (includes new task-17 migration)**

```bash
php artisan migrate
```

- [ ] **Step 3: Regenerate schema dump**

```bash
php artisan schema:dump
```

- [ ] **Step 4: Commit schema dump if changed**

```bash
git add database/schema/ && git commit -m "chore(db): refresh schema dump"
```

---

## Task 22: End-to-end smoke via Playwright

**Files:**
- Create: `next-app/tests/e2e/landing-page-flow.spec.ts`

- [ ] **Step 1: Playwright spec**

```ts
import { test, expect } from '@playwright/test';

test('landing page generation — full happy path', async ({ page }) => {
  await page.goto('http://localhost:8000/admin/login');
  await page.fill('input[name=email]', process.env.TEST_ADMIN_EMAIL ?? 'admin@example.com');
  await page.fill('input[name=password]', process.env.TEST_ADMIN_PASSWORD ?? 'password');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/admin/);

  // Navigate to a summit edit page — picks the first summit
  await page.goto('http://localhost:8000/admin/summits');
  await page.locator('table tbody tr').first().click();
  await page.fill('input[name=style_reference_url]', 'https://parenting-summits.com');
  await page.click('button:has-text("Save")');
  await page.click('button:has-text("Build Style Brief")');
  // Wait up to 2 min for brief to become ready (poll via page reload)
  for (let i = 0; i < 24; i++) {
    await page.reload();
    const status = await page.locator('text=ready').first().isVisible().catch(() => false);
    if (status) break;
    await page.waitForTimeout(5_000);
  }
  await expect(page.locator('text=ready').first()).toBeVisible({ timeout: 10_000 });
});
```

- [ ] **Step 2: Manual run note**

This spec is meant for manual smoke (not CI) — document in `docs/landing-page-smoke.md`:
> Run with `TEST_ADMIN_EMAIL=... TEST_ADMIN_PASSWORD=... npx playwright test next-app/tests/e2e/landing-page-flow.spec.ts`.

- [ ] **Step 3: Commit**

```bash
git add next-app/tests/e2e/ docs/landing-page-smoke.md \
  && git commit -m "chore(tests): playwright smoke for landing-page flow"
```

---

## Task 23: Self-audit

- [ ] **Step 1: Run PHP tests**

```bash
php artisan test 2>&1 | tail -40
```

- [ ] **Step 2: Run Next.js build**

```bash
cd next-app && pnpm typecheck && cd ..
```

- [ ] **Step 3: Verify all migrations are in database/schema**

```bash
php artisan migrate:status | tail -20
```

- [ ] **Step 4: Verify queue + storage link**

```bash
ls -la public/storage && php artisan queue:failed
```

- [ ] **Step 5: Commit any fixes**

---

## Self-Review

**Spec coverage:**
- Migrations 1–4: Tasks 1 + 17 (extra batches migration)
- StyleBriefResolver: Task 4
- Phase 0 backend: Tasks 5–9
- Phase 0 UX: Tasks 10–11
- Stage 1 image: Task 12
- Stage 2 wiring: Tasks 13–14
- LandingPageGenerator rewrite: Task 15
- ArchitectPhase allowedTypes: Task 16
- Generate form upgrade: Task 17
- Per-section regen: Task 18
- Operator UX details (mockup link, badges): Task 19
- PruneMockupsJob: Task 20
- Infra (storage link, schema dump): Task 21
- Playwright smoke: Task 22
- Audit: Task 23

All spec sections mapped.
