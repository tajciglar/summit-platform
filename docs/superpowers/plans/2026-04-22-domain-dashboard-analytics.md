# Domain Dashboard Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-summit funnel analytics to `/admin/{domain}` — visits, optin submits, sales views, and checkout clicks — so operators can spot drop-off at a glance.

**Architecture:** Reuse the existing `page_views` table, add a tenant-scoped API endpoint that writes rows for client events, append an optin_submit write server-side inside `OptinController`, fire a client tracker from the Next.js optin/sales pages, and render two new Filament `TableWidget`s (live + past summits) on the dashboard.

**Tech Stack:** Laravel 13, Filament v4, Pest 4, PostgreSQL, Next.js 16 (React 19).

**Spec:** `docs/superpowers/specs/2026-04-22-domain-dashboard-analytics-design.md`

**Branch:** `feat/domain-dashboard-analytics` (worktree at `.worktrees/analytics-dashboard`)

---

## File Structure

**New PHP files:**
- `database/migrations/2026_04_22_120000_add_summit_page_type_index_to_page_views.php` — composite index `(summit_id, page_type, created_at)`
- `app/Http/Controllers/Api/TrackPageViewController.php` — single-action controller, thin wrapper around `RecordPageView`
- `app/Services/Analytics/FunnelMetrics.php` — computes the 4 counts + conversion %s + leak alerts for one summit; centralized so widgets and future tests share logic
- `app/Filament/Widgets/LiveSummitsFunnelWidget.php` — expanded cards for live summits
- `app/Filament/Widgets/PastSummitsFunnelWidget.php` — collapsed rows, lazy-loaded
- `resources/views/filament/widgets/live-summits-funnel.blade.php`
- `resources/views/filament/widgets/past-summits-funnel.blade.php`
- `resources/views/filament/widgets/partials/funnel-bar.blade.php` — shared 4-step bar rendering

**New tests:**
- `tests/Feature/Analytics/TrackPageViewTest.php`
- `tests/Feature/Analytics/OptinSubmitTrackingTest.php`
- `tests/Unit/Analytics/FunnelMetricsTest.php`
- `tests/Feature/Filament/LiveSummitsFunnelWidgetTest.php`
- `tests/Feature/Filament/PastSummitsFunnelWidgetTest.php`

**Modified PHP files:**
- `app/Http/Controllers/Api/OptinController.php` — append `RecordPageView` call for `optin_submit` after `Optin::create`
- `app/Filament/Pages/Dashboard.php` — register the two new widgets
- `routes/api.php` — add `POST /api/track/page-view`

**New / modified Next.js files:**
- `next-app/src/lib/analytics/trackPageView.ts` — client helper that POSTs to Laravel
- `next-app/src/app/api/track/page-view/route.ts` — Next.js proxy to Laravel (same pattern as `src/app/api/optin/route.ts`)
- `next-app/src/app/f/[funnel]/optin/page.tsx` — fire `trackPageView('optin', ...)` on mount
- `next-app/src/app/f/[funnel]/sales/page.tsx` — fire `trackPageView('sales', ...)` on mount
- The sales CTA block(s) that redirect to WP checkout — fire `trackPageView('checkout_click', ...)` before redirecting

---

## Task 1: Add the composite index migration

**Files:**
- Create: `database/migrations/2026_04_22_120000_add_summit_page_type_index_to_page_views.php`

- [ ] **Step 1: Create migration file**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Composite index used by FunnelMetrics::countsForSummit(). Without this,
 * COUNT(*) FILTER (...) queries degenerate to sequential scans once
 * page_views grows past a few million rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE INDEX IF NOT EXISTS page_views_summit_type_created_idx
            ON page_views (summit_id, page_type, created_at)
        ');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS page_views_summit_type_created_idx');
    }
};
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate --no-interaction
```

Expected: migration completes, no errors.

- [ ] **Step 3: Verify index exists**

```bash
php artisan tinker --execute 'echo DB::selectOne("SELECT indexname FROM pg_indexes WHERE indexname = ?", ["page_views_summit_type_created_idx"])?->indexname ?? "MISSING";'
```

Expected: `page_views_summit_type_created_idx`

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_22_120000_add_summit_page_type_index_to_page_views.php
git commit -m "feat(analytics): composite index for summit funnel counts"
```

---

## Task 2: Unit-test FunnelMetrics count logic (failing test first)

**Files:**
- Test: `tests/Unit/Analytics/FunnelMetricsTest.php`

- [ ] **Step 1: Create test file with failing test**

```php
<?php

use App\Models\PageView;
use App\Models\Summit;
use App\Services\Analytics\FunnelMetrics;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns zeroed counts when no page views exist', function () {
    $summit = Summit::factory()->create();

    $counts = app(FunnelMetrics::class)->countsForSummit($summit);

    expect($counts)->toMatchArray([
        'optin_views' => 0,
        'optin_submits' => 0,
        'sales_views' => 0,
        'checkout_clicks' => 0,
    ]);
});

it('counts page_views grouped by page_type for the summit', function () {
    $summit = Summit::factory()->create();
    $other = Summit::factory()->create();

    PageView::factory()->count(10)->for($summit)->state(['page_type' => 'optin'])->create();
    PageView::factory()->count(4)->for($summit)->state(['page_type' => 'optin_submit'])->create();
    PageView::factory()->count(3)->for($summit)->state(['page_type' => 'sales'])->create();
    PageView::factory()->count(1)->for($summit)->state(['page_type' => 'checkout_click'])->create();

    // Noise from another summit must not leak in.
    PageView::factory()->count(99)->for($other)->state(['page_type' => 'optin'])->create();

    $counts = app(FunnelMetrics::class)->countsForSummit($summit);

    expect($counts)->toMatchArray([
        'optin_views' => 10,
        'optin_submits' => 4,
        'sales_views' => 3,
        'checkout_clicks' => 1,
    ]);
});

it('computes conversion rates and flags leaks below thresholds', function () {
    $summit = Summit::factory()->create();
    PageView::factory()->count(100)->for($summit)->state(['page_type' => 'optin'])->create();
    PageView::factory()->count(10)->for($summit)->state(['page_type' => 'optin_submit'])->create();  // 10% — below 20 threshold
    PageView::factory()->count(8)->for($summit)->state(['page_type' => 'sales'])->create();         // 80% — above 60
    PageView::factory()->count(1)->for($summit)->state(['page_type' => 'checkout_click'])->create();// 12.5% — above 10

    $report = app(FunnelMetrics::class)->reportForSummit($summit);

    expect($report['conversions']['optin_to_submit'])->toEqualWithDelta(0.10, 0.001);
    expect($report['leaks'])->toEqualCanonicalizing(['optin_to_submit']);
});
```

- [ ] **Step 2: Run — must fail (class does not exist)**

```bash
php artisan test --compact --filter=FunnelMetricsTest
```

Expected: `Class "App\Services\Analytics\FunnelMetrics" not found` or equivalent.

---

## Task 3: Implement FunnelMetrics service

**Files:**
- Create: `app/Services/Analytics/FunnelMetrics.php`

- [ ] **Step 1: Create the service**

```php
<?php

namespace App\Services\Analytics;

use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Support\Facades\Cache;

/**
 * Computes the 4-step funnel counts + conversion rates + leak flags for a
 * single summit. Used by LiveSummitsFunnelWidget and PastSummitsFunnelWidget.
 */
class FunnelMetrics
{
    public const PAGE_TYPES = ['optin', 'optin_submit', 'sales', 'checkout_click'];

    /** Minimum acceptable conversion rate per step. Below this = leak alert. */
    public const LEAK_THRESHOLDS = [
        'optin_to_submit' => 0.20,
        'submit_to_sales' => 0.60,
        'sales_to_checkout' => 0.10,
    ];

    /**
     * @return array{optin_views:int, optin_submits:int, sales_views:int, checkout_clicks:int}
     */
    public function countsForSummit(Summit $summit): array
    {
        $row = PageView::query()
            ->where('summit_id', $summit->getKey())
            ->selectRaw("
                COUNT(*) FILTER (WHERE page_type = 'optin')          AS optin_views,
                COUNT(*) FILTER (WHERE page_type = 'optin_submit')   AS optin_submits,
                COUNT(*) FILTER (WHERE page_type = 'sales')          AS sales_views,
                COUNT(*) FILTER (WHERE page_type = 'checkout_click') AS checkout_clicks
            ")
            ->first();

        return [
            'optin_views' => (int) ($row->optin_views ?? 0),
            'optin_submits' => (int) ($row->optin_submits ?? 0),
            'sales_views' => (int) ($row->sales_views ?? 0),
            'checkout_clicks' => (int) ($row->checkout_clicks ?? 0),
        ];
    }

    /**
     * @return array{counts:array, conversions:array, leaks:list<string>}
     */
    public function reportForSummit(Summit $summit): array
    {
        $counts = $this->countsForSummit($summit);

        $conversions = [
            'optin_to_submit' => $this->rate($counts['optin_submits'], $counts['optin_views']),
            'submit_to_sales' => $this->rate($counts['sales_views'], $counts['optin_submits']),
            'sales_to_checkout' => $this->rate($counts['checkout_clicks'], $counts['sales_views']),
        ];

        $leaks = [];
        foreach (self::LEAK_THRESHOLDS as $key => $threshold) {
            if ($conversions[$key] !== null && $conversions[$key] < $threshold) {
                $leaks[] = $key;
            }
        }

        return compact('counts', 'conversions', 'leaks');
    }

    /**
     * @return array{counts:array, conversions:array, leaks:list<string>}
     */
    public function cachedReportForSummit(Summit $summit, int $ttl = 60): array
    {
        $key = "funnel:{$summit->getKey()}:".$summit->updated_at?->timestamp;

        return Cache::remember($key, $ttl, fn () => $this->reportForSummit($summit));
    }

    private function rate(int $numerator, int $denominator): ?float
    {
        if ($denominator === 0) {
            return null;
        }

        return $numerator / $denominator;
    }
}
```

- [ ] **Step 2: Ensure PageView factory supports `page_type` and `for($summit)`**

Check `database/factories/PageViewFactory.php`. Run:

```bash
grep -n "page_type\|summit_id" database/factories/PageViewFactory.php 2>/dev/null || echo "FACTORY MISSING"
```

If the factory does not exist, create it:

```bash
php artisan make:factory PageViewFactory --model=PageView --no-interaction
```

Then populate it:

```php
<?php

namespace Database\Factories;

use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;

class PageViewFactory extends Factory
{
    protected $model = PageView::class;

    public function definition(): array
    {
        return [
            'summit_id' => Summit::factory(),
            'page_url' => $this->faker->url(),
            'page_type' => 'optin',
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
        ];
    }
}
```

- [ ] **Step 3: Run test to verify pass**

```bash
php artisan test --compact --filter=FunnelMetricsTest
```

Expected: 3 passing.

- [ ] **Step 4: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 5: Commit**

```bash
git add app/Services/Analytics/FunnelMetrics.php tests/Unit/Analytics/FunnelMetricsTest.php database/factories/PageViewFactory.php
git commit -m "feat(analytics): FunnelMetrics service computes counts, conversions, leaks"
```

---

## Task 4: Feature-test the track-page-view endpoint (failing first)

**Files:**
- Test: `tests/Feature/Analytics/TrackPageViewTest.php`

- [ ] **Step 1: Create failing test**

```php
<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\PageView;
use App\Models\Summit;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function trackPayload(Summit $summit, Funnel $funnel, FunnelStep $step, string $type): array
{
    return [
        'page_type' => $type,
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
    ];
}

it('records a page_view for each allowed client-writable page_type', function (string $type) {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create();

    $this->postJson('/api/track/page-view', trackPayload($summit, $funnel, $step, $type))
        ->assertNoContent();

    expect(PageView::where('summit_id', $summit->id)->where('page_type', $type)->count())->toBe(1);
})->with(['optin', 'sales', 'checkout_click']);

it('rejects optin_submit (server-only) and unknown page_types', function (string $type) {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create();

    $this->postJson('/api/track/page-view', trackPayload($summit, $funnel, $step, $type))
        ->assertStatus(422);

    expect(PageView::count())->toBe(0);
})->with(['optin_submit', 'garbage', '']);

it('rejects missing summit/funnel/step', function () {
    $this->postJson('/api/track/page-view', [
        'page_type' => 'optin',
        'summit_id' => '00000000-0000-0000-0000-000000000000',
        'funnel_id' => '00000000-0000-0000-0000-000000000000',
        'funnel_step_id' => '00000000-0000-0000-0000-000000000000',
    ])->assertStatus(422);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
php artisan test --compact --filter=TrackPageViewTest
```

Expected: 404 or route-not-found failures.

---

## Task 5: Implement the track-page-view endpoint

**Files:**
- Create: `app/Http/Controllers/Api/TrackPageViewController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create the controller**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Actions\RecordPageView;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Client-facing funnel event tracker. Writes one row to page_views per call.
 *
 * NOTE: optin_submit is deliberately NOT accepted here — that event is
 * written server-side inside OptinController so it cannot be spoofed.
 */
class TrackPageViewController extends Controller
{
    public const CLIENT_WRITABLE_TYPES = ['optin', 'sales', 'checkout_click'];

    public function __invoke(Request $request, RecordPageView $recorder): Response
    {
        $data = $request->validate([
            'page_type' => ['required', 'string', 'in:'.implode(',', self::CLIENT_WRITABLE_TYPES)],
            'summit_id' => ['required', 'uuid', 'exists:summits,id'],
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
            'funnel_step_id' => ['required', 'uuid', 'exists:funnel_steps,id'],
        ]);

        $recorder->handle(
            $request,
            summitId: $data['summit_id'],
            funnelId: $data['funnel_id'],
            funnelStepId: $data['funnel_step_id'],
            pageType: $data['page_type'],
        );

        return response()->noContent();
    }
}
```

- [ ] **Step 2: Register the route**

Add to `routes/api.php` near the existing `Route::post('/optins', ...)`:

```php
Route::post('/track/page-view', \App\Http\Controllers\Api\TrackPageViewController::class)
    ->middleware('throttle:120,1');
```

- [ ] **Step 3: Run test, confirm pass**

```bash
php artisan test --compact --filter=TrackPageViewTest
```

Expected: 7 passing (3 allowed types + 3 invalid types + 1 missing-foreign-key).

- [ ] **Step 4: Pint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/Api/TrackPageViewController.php routes/api.php tests/Feature/Analytics/TrackPageViewTest.php
git commit -m "feat(analytics): POST /api/track/page-view for client funnel events"
```

---

## Task 6: Server-side optin_submit write (failing test first)

**Files:**
- Test: `tests/Feature/Analytics/OptinSubmitTrackingTest.php`

- [ ] **Step 1: Create the failing test**

```php
<?php

use App\Models\Funnel;
use App\Models\Optin;
use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Support\Facades\Queue;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('writes a page_view row with page_type=optin_submit when an optin is created', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $this->postJson('/api/optins', [
        'first_name' => 'Taj',
        'email' => 'taj@example.com',
        'funnel_id' => $funnel->id,
    ])->assertOk();

    expect(Optin::count())->toBe(1);
    expect(PageView::where('page_type', 'optin_submit')->where('summit_id', $summit->id)->count())->toBe(1);
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
php artisan test --compact --filter=OptinSubmitTrackingTest
```

Expected: second expectation fails — 0 page_views.

---

## Task 7: Add the optin_submit write to OptinController

**Files:**
- Modify: `app/Http/Controllers/Api/OptinController.php`

- [ ] **Step 1: Inject RecordPageView and write page_view after Optin::create**

Replace the full `store` method body so the final controller reads:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Actions\RecordPageView;
use App\Http\Controllers\Controller;
use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptinController extends Controller
{
    public function store(Request $request, RecordPageView $recorder): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
        ]);

        $funnel = Funnel::with('summit')->findOrFail($data['funnel_id']);

        $contact = Contact::updateOrCreate(
            ['email' => $data['email']],
            ['first_name' => $data['first_name']],
        );

        $optin = Optin::create([
            'contact_id' => $contact->id,
            'email' => $data['email'],
            'first_name' => $data['first_name'],
            'funnel_id' => $funnel->id,
            'summit_id' => $funnel->summit->id,
            'ip_address' => $request->ip(),
            'source_url' => $request->header('Referer'),
            'user_agent' => $request->userAgent(),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_content' => $request->input('utm_content'),
            'utm_term' => $request->input('utm_term'),
        ]);

        $recorder->handle(
            $request,
            summitId: $funnel->summit->id,
            funnelId: $funnel->id,
            pageType: 'optin_submit',
        );

        SyncOptinToActiveCampaign::dispatch($optin);

        $redirect = sprintf(
            '/%s/%s/sales?email=%s&first_name=%s',
            $funnel->summit->slug,
            $funnel->slug,
            urlencode($data['email']),
            urlencode($data['first_name']),
        );

        return response()->json(['redirect' => $redirect]);
    }
}
```

- [ ] **Step 2: Run test, confirm pass**

```bash
php artisan test --compact --filter=OptinSubmitTrackingTest
```

Expected: 1 passing.

- [ ] **Step 3: Pint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/Api/OptinController.php tests/Feature/Analytics/OptinSubmitTrackingTest.php
git commit -m "feat(analytics): server-side optin_submit page_view write"
```

---

## Task 8: Filament widget test — LiveSummitsFunnelWidget (failing first)

**Files:**
- Test: `tests/Feature/Filament/LiveSummitsFunnelWidgetTest.php`

- [ ] **Step 1: Create failing test**

```php
<?php

use App\Filament\Widgets\LiveSummitsFunnelWidget;
use App\Models\Domain;
use App\Models\PageView;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use function Pest\Livewire\livewire;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->create();
    $this->user->domains()->attach($this->domain);
    $this->actingAs($this->user);
    Filament::setTenant($this->domain);
});

it('renders only summits that are currently live on the active domain', function () {
    $live = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    $past = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subMonth(),
        'ends_at' => now()->subWeek(),
    ]);
    $upcoming = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->addDay(),
        'ends_at' => now()->addMonth(),
    ]);

    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee($live->title)
        ->assertDontSee($past->title)
        ->assertDontSee($upcoming->title);
});

it('renders the four funnel counts and conversion rates', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    PageView::factory()->count(100)->for($summit)->state(['page_type' => 'optin'])->create();
    PageView::factory()->count(30)->for($summit)->state(['page_type' => 'optin_submit'])->create();
    PageView::factory()->count(20)->for($summit)->state(['page_type' => 'sales'])->create();
    PageView::factory()->count(5)->for($summit)->state(['page_type' => 'checkout_click'])->create();

    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee('100')
        ->assertSee('30')
        ->assertSee('20')
        ->assertSee('5')
        ->assertSee('30.0%')     // optin->submit
        ->assertSee('66.7%')     // submit->sales
        ->assertSee('25.0%');    // sales->checkout
});

it('shows a leak alert when a step conversion is below the threshold', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    // 10% optin->submit (below 20% threshold)
    PageView::factory()->count(100)->for($summit)->state(['page_type' => 'optin'])->create();
    PageView::factory()->count(10)->for($summit)->state(['page_type' => 'optin_submit'])->create();
    PageView::factory()->count(9)->for($summit)->state(['page_type' => 'sales'])->create();
    PageView::factory()->count(1)->for($summit)->state(['page_type' => 'checkout_click'])->create();

    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee('Leak alert');
});

it('handles a summit with zero traffic without crashing', function () {
    Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);

    livewire(LiveSummitsFunnelWidget::class)
        ->assertOk();
});
```

- [ ] **Step 2: Run — must fail (widget class does not exist)**

```bash
php artisan test --compact --filter=LiveSummitsFunnelWidgetTest
```

Expected: class-not-found errors.

---

## Task 9: Implement LiveSummitsFunnelWidget

**Files:**
- Create: `app/Filament/Widgets/LiveSummitsFunnelWidget.php`
- Create: `resources/views/filament/widgets/live-summits-funnel.blade.php`
- Create: `resources/views/filament/widgets/partials/funnel-bar.blade.php`

- [ ] **Step 1: Create the widget class**

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Domain;
use App\Models\Summit;
use App\Services\Analytics\FunnelMetrics;
use Filament\Facades\Filament;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class LiveSummitsFunnelWidget extends Widget
{
    protected string $view = 'filament.widgets.live-summits-funnel';

    protected int|string|array $columnSpan = 'full';

    /**
     * @return Collection<int, array{summit: Summit, report: array}>
     */
    public function getData(): Collection
    {
        $domain = Filament::getTenant();
        if (! $domain instanceof Domain) {
            return collect();
        }

        $summits = Summit::query()
            ->withoutGlobalScopes()
            ->where('domain_id', $domain->getKey())
            ->where('pre_summit_starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->orderBy('title')
            ->get();

        $metrics = app(FunnelMetrics::class);

        return $summits->map(fn (Summit $summit) => [
            'summit' => $summit,
            'report' => $metrics->cachedReportForSummit($summit),
        ]);
    }
}
```

- [ ] **Step 2: Create the shared funnel-bar partial**

`resources/views/filament/widgets/partials/funnel-bar.blade.php`:

```blade
@props(['report'])

@php
    $counts = $report['counts'];
    $conv = $report['conversions'];
    $leaks = $report['leaks'];

    $format = fn (?float $rate): string => $rate === null ? '—' : number_format($rate * 100, 1).'%';

    $leakLabels = [
        'optin_to_submit' => 'Optin page → Optin submit',
        'submit_to_sales' => 'Optin submit → Sales page',
        'sales_to_checkout' => 'Sales page → Checkout click',
    ];
@endphp

<div class="grid grid-cols-4 gap-4 text-center">
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Optin views</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['optin_views']) }}</div>
    </div>
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Optin submits</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['optin_submits']) }}</div>
        <div class="text-xs text-gray-400">{{ $format($conv['optin_to_submit']) }}</div>
    </div>
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Sales views</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['sales_views']) }}</div>
        <div class="text-xs text-gray-400">{{ $format($conv['submit_to_sales']) }}</div>
    </div>
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Checkout clicks</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['checkout_clicks']) }}</div>
        <div class="text-xs text-gray-400">{{ $format($conv['sales_to_checkout']) }}</div>
    </div>
</div>

@if (! empty($leaks))
    <div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
        <strong>Leak alert:</strong>
        <ul class="mt-1 list-disc list-inside">
            @foreach ($leaks as $leak)
                <li>{{ $leakLabels[$leak] ?? $leak }} — conversion below target</li>
            @endforeach
        </ul>
    </div>
@endif
```

- [ ] **Step 3: Create the live summits view**

`resources/views/filament/widgets/live-summits-funnel.blade.php`:

```blade
<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Live summits</x-slot>

        @php($rows = $this->getData())

        @if ($rows->isEmpty())
            <p class="text-sm text-gray-500">No summits are live on this domain right now.</p>
        @else
            <div class="space-y-6">
                @foreach ($rows as $row)
                    @php($summit = $row['summit'])
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div class="mb-3 flex items-center justify-between">
                            <div>
                                <div class="text-base font-semibold">{{ $summit->title }}</div>
                                <div class="text-xs text-gray-500">
                                    live ·
                                    {{ $summit->pre_summit_starts_at?->toFormattedDateString() }}
                                    –
                                    {{ $summit->ends_at?->toFormattedDateString() }}
                                </div>
                            </div>
                        </div>
                        <x-filament::hr class="my-2" />
                        @include('filament.widgets.partials.funnel-bar', ['report' => $row['report']])
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
```

- [ ] **Step 4: Run test, confirm pass**

```bash
php artisan test --compact --filter=LiveSummitsFunnelWidgetTest
```

Expected: 4 passing.

- [ ] **Step 5: Pint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Filament/Widgets/LiveSummitsFunnelWidget.php resources/views/filament/widgets/live-summits-funnel.blade.php resources/views/filament/widgets/partials/funnel-bar.blade.php tests/Feature/Filament/LiveSummitsFunnelWidgetTest.php
git commit -m "feat(analytics): LiveSummitsFunnelWidget renders 4-step funnel"
```

---

## Task 10: PastSummitsFunnelWidget test (failing first)

**Files:**
- Test: `tests/Feature/Filament/PastSummitsFunnelWidgetTest.php`

- [ ] **Step 1: Create failing test**

```php
<?php

use App\Filament\Widgets\PastSummitsFunnelWidget;
use App\Models\Domain;
use App\Models\PageView;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use function Pest\Livewire\livewire;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->create();
    $this->user->domains()->attach($this->domain);
    $this->actingAs($this->user);
    Filament::setTenant($this->domain);
});

it('only lists summits that have ended on this domain', function () {
    $past = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subMonth(),
        'ends_at' => now()->subWeek(),
    ]);
    $live = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);

    livewire(PastSummitsFunnelWidget::class)
        ->assertSee($past->title)
        ->assertDontSee($live->title);
});

it('is collapsed by default and loads the funnel lazily on expand', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subMonth(),
        'ends_at' => now()->subWeek(),
    ]);
    PageView::factory()->count(7)->for($summit)->state(['page_type' => 'optin'])->create();

    livewire(PastSummitsFunnelWidget::class)
        ->assertSee($summit->title)
        ->assertDontSee('Optin views') // collapsed — funnel bar not rendered
        ->call('toggleExpanded', $summit->id)
        ->assertSee('Optin views')
        ->assertSee('7');
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
php artisan test --compact --filter=PastSummitsFunnelWidgetTest
```

Expected: class-not-found errors.

---

## Task 11: Implement PastSummitsFunnelWidget

**Files:**
- Create: `app/Filament/Widgets/PastSummitsFunnelWidget.php`
- Create: `resources/views/filament/widgets/past-summits-funnel.blade.php`

- [ ] **Step 1: Create the widget class**

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Domain;
use App\Models\Summit;
use App\Services\Analytics\FunnelMetrics;
use Filament\Facades\Filament;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class PastSummitsFunnelWidget extends Widget
{
    protected string $view = 'filament.widgets.past-summits-funnel';

    protected int|string|array $columnSpan = 'full';

    /** @var array<string, bool> Keyed by summit ID. */
    public array $expanded = [];

    public function toggleExpanded(string $summitId): void
    {
        $this->expanded[$summitId] = ! ($this->expanded[$summitId] ?? false);
    }

    /**
     * @return Collection<int, Summit>
     */
    public function getSummits(): Collection
    {
        $domain = Filament::getTenant();
        if (! $domain instanceof Domain) {
            return collect();
        }

        return Summit::query()
            ->withoutGlobalScopes()
            ->where('domain_id', $domain->getKey())
            ->where('ends_at', '<', now())
            ->orderByDesc('ends_at')
            ->get();
    }

    /**
     * @return array{counts:array, conversions:array, leaks:list<string>}
     */
    public function getReport(Summit $summit): array
    {
        return app(FunnelMetrics::class)->cachedReportForSummit($summit, ttl: 86400);
    }
}
```

- [ ] **Step 2: Create the view**

`resources/views/filament/widgets/past-summits-funnel.blade.php`:

```blade
<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Past summits</x-slot>

        @php($summits = $this->getSummits())

        @if ($summits->isEmpty())
            <p class="text-sm text-gray-500">No past summits on this domain yet.</p>
        @else
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                @foreach ($summits as $summit)
                    @php($isOpen = $this->expanded[$summit->id] ?? false)
                    <div class="py-3">
                        <button
                            type="button"
                            wire:click="toggleExpanded('{{ $summit->id }}')"
                            class="w-full flex items-center justify-between text-left"
                        >
                            <div>
                                <span class="font-medium">{{ $summit->title }}</span>
                                <span class="ml-2 text-xs text-gray-500">
                                    ended {{ $summit->ends_at?->toFormattedDateString() }}
                                </span>
                            </div>
                            <span class="text-sm text-gray-400">{{ $isOpen ? '▾' : '▸' }}</span>
                        </button>

                        @if ($isOpen)
                            <div class="mt-3">
                                @include('filament.widgets.partials.funnel-bar', [
                                    'report' => $this->getReport($summit),
                                ])
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
```

- [ ] **Step 3: Run test, confirm pass**

```bash
php artisan test --compact --filter=PastSummitsFunnelWidgetTest
```

Expected: 2 passing.

- [ ] **Step 4: Pint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Filament/Widgets/PastSummitsFunnelWidget.php resources/views/filament/widgets/past-summits-funnel.blade.php tests/Feature/Filament/PastSummitsFunnelWidgetTest.php
git commit -m "feat(analytics): PastSummitsFunnelWidget with lazy-expand drawer"
```

---

## Task 12: Register the widgets on the dashboard

**Files:**
- Modify: `app/Filament/Pages/Dashboard.php`

- [ ] **Step 1: Update Dashboard::getWidgets**

```php
<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\LiveSummitsFunnelWidget;
use App\Filament\Widgets\PastSummitsFunnelWidget;
use App\Filament\Widgets\SummitsWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    public function getWidgets(): array
    {
        return [
            SummitsWidget::class,
            LiveSummitsFunnelWidget::class,
            PastSummitsFunnelWidget::class,
        ];
    }

    public function getColumns(): int|array
    {
        return 1;
    }
}
```

- [ ] **Step 2: Run the analytics test slice end-to-end**

```bash
php artisan test --compact --filter='TrackPageViewTest|OptinSubmitTrackingTest|FunnelMetricsTest|LiveSummitsFunnelWidgetTest|PastSummitsFunnelWidgetTest'
```

Expected: 16 tests passing.

- [ ] **Step 3: Pint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Filament/Pages/Dashboard.php
git commit -m "feat(analytics): register live + past summit widgets on dashboard"
```

---

## Task 13: Next.js tracker helper

**Files:**
- Create: `next-app/src/lib/analytics/trackPageView.ts`
- Create: `next-app/src/app/api/track/page-view/route.ts`

- [ ] **Step 1: Create the client helper**

`next-app/src/lib/analytics/trackPageView.ts`:

```ts
type PageType = 'optin' | 'sales' | 'checkout_click';

type TrackPayload = {
  page_type: PageType;
  summit_id: string;
  funnel_id: string;
  funnel_step_id: string;
};

/**
 * Fire-and-forget POST to our Next.js proxy, which forwards to Laravel.
 * Never blocks the caller; swallows errors — analytics is not critical-path.
 */
export async function trackPageView(payload: TrackPayload): Promise<void> {
  try {
    await fetch('/api/track/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // intentionally swallowed
  }
}
```

- [ ] **Step 2: Create the Next.js proxy route**

Follow the pattern of `next-app/src/app/api/optin/route.ts`. `next-app/src/app/api/track/page-view/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';

const LARAVEL = process.env.LARAVEL_API_BASE ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.text();

  const res = await fetch(`${LARAVEL}/api/track/page-view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}
```

- [ ] **Step 3: Typecheck**

```bash
cd next-app && pnpm typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
cd ..
git add next-app/src/lib/analytics/trackPageView.ts next-app/src/app/api/track/page-view/route.ts
git commit -m "feat(analytics): Next.js tracker helper + /api/track/page-view proxy"
```

---

## Task 14: Wire the tracker into the optin and sales pages

**Files:**
- Modify: `next-app/src/app/f/[funnel]/optin/page.tsx` — fire `trackPageView('optin', ...)` on mount
- Modify: `next-app/src/app/f/[funnel]/sales/page.tsx` — fire `trackPageView('sales', ...)` on mount

- [ ] **Step 1: Read both pages to find where summit/funnel/step IDs are available**

```bash
cat next-app/src/app/f/[funnel]/optin/page.tsx
cat next-app/src/app/f/[funnel]/sales/page.tsx
```

- [ ] **Step 2: Add a small client component that fires the tracker on mount**

Create `next-app/src/lib/analytics/PageViewTracker.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { trackPageView } from './trackPageView';

type Props = {
  pageType: 'optin' | 'sales';
  summitId: string;
  funnelId: string;
  funnelStepId: string;
};

export function PageViewTracker({ pageType, summitId, funnelId, funnelStepId }: Props) {
  useEffect(() => {
    trackPageView({
      page_type: pageType,
      summit_id: summitId,
      funnel_id: funnelId,
      funnel_step_id: funnelStepId,
    });
  }, [pageType, summitId, funnelId, funnelStepId]);

  return null;
}
```

- [ ] **Step 3: Render `<PageViewTracker>` inside both the optin and sales page components**

In each page, once the funnel/step data is resolved server-side, pass `summitId`, `funnelId`, and `funnelStepId` through as props and render:

```tsx
<PageViewTracker
  pageType="optin"   // or "sales" in sales/page.tsx
  summitId={summit.id}
  funnelId={funnel.id}
  funnelStepId={step.id}
/>
```

The exact integration point depends on how the page already structures its data load; read each page first and place the tracker at the top of the returned JSX where the summit/funnel/step are in scope.

- [ ] **Step 4: Typecheck**

```bash
cd next-app && pnpm typecheck && cd ..
```

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/analytics/PageViewTracker.tsx next-app/src/app/f/[funnel]/optin/page.tsx next-app/src/app/f/[funnel]/sales/page.tsx
git commit -m "feat(analytics): fire page_view tracker from optin and sales pages"
```

---

## Task 15: Fire checkout_click before the WP redirect

**Files:**
- Modify: the sales-page CTA block(s) that perform the WP checkout redirect

Find the block(s) that perform the redirect. Likely candidates in `next-app/src/blocks/form-cta/`:

```bash
grep -rn "wp_checkout_redirect_url\|checkout_redirect" next-app/src/ | head
```

- [ ] **Step 1: Locate the redirect handler**

Find the `onClick` or `href` that drives the redirect. Capture summit/funnel/step IDs already passed into the block (every block receives these via the template renderer).

- [ ] **Step 2: Replace the direct redirect with a tracked redirect**

Change the handler from:

```tsx
<a href={redirectUrl}>Buy now</a>
```

…to an explicit click handler that fires the tracker and *then* navigates:

```tsx
<a
  href={redirectUrl}
  onClick={(e) => {
    e.preventDefault();
    trackPageView({
      page_type: 'checkout_click',
      summit_id: summitId,
      funnel_id: funnelId,
      funnel_step_id: funnelStepId,
    }).finally(() => {
      window.location.href = redirectUrl;
    });
  }}
>
  Buy now
</a>
```

`.finally()` is used so a failed track doesn't block the redirect.

- [ ] **Step 3: Typecheck**

```bash
cd next-app && pnpm typecheck && cd ..
```

- [ ] **Step 4: Commit**

```bash
git add next-app/src/blocks/
git commit -m "feat(analytics): track checkout_click before WP redirect"
```

---

## Task 16: End-to-end smoke test + final verification

- [ ] **Step 1: Run the full analytics test suite**

```bash
php artisan test --compact --filter='Analytics|FunnelMetrics|Funnel.*Widget|OptinSubmit'
```

Expected: all green.

- [ ] **Step 2: Run full Pest suite to confirm no regressions**

```bash
php artisan test --compact
```

Expected: all green, or only pre-existing failures unrelated to this work.

- [ ] **Step 3: Manual verification** (document what you did in the commit message)

1. Start `composer dev`.
2. Open `/admin/{domain}` for a domain with a live summit.
3. Verify the Live Summits widget appears with zeroed counts (no traffic yet).
4. Visit the optin page on the public site → confirm `page_views` now has one `optin` row (`php artisan tinker --execute 'echo App\Models\PageView::latest()->first()->page_type;'`).
5. Submit the optin form → confirm both `optin_submit` and subsequent `sales` page load create rows.
6. Click the checkout CTA → confirm `checkout_click` row is created.
7. Reload `/admin/{domain}` → numbers now reflect the real traffic.

- [ ] **Step 4: Commit the completion marker**

```bash
git commit --allow-empty -m "chore(analytics): Phase 1 funnel analytics shipped (manual QA passed)"
```

---

## Deferred (out of scope — Phase 2)

- Revenue panel (gross, net, refunds, AOV) — blocked on native Stripe checkout
- Bump attach rate / upsell take rate
- UTM segment filtering on the domain dashboard (already covered by the standalone `UtmBreakdown` page)
- Per-summit override of leak alert thresholds
