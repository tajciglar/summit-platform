<?php

use App\Models\PageView;
use App\Models\Summit;
use App\Models\User;
use App\Services\Analytics\SummitAnalytics;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function makeOrder(Summit $summit, int $totalCents, Carbon $createdAt, array $items = [], string $status = 'completed'): void
{
    $user = User::factory()->create();

    DB::table('orders')->insert([
        'id' => (string) Str::uuid(),
        'order_number' => 'O-'.Str::random(6),
        'user_id' => $user->id,
        'summit_id' => $summit->id,
        'phase_at_purchase' => 'summit_starts',
        'status' => $status,
        'subtotal_cents' => $totalCents,
        'discount_cents' => 0,
        'total_cents' => $totalCents,
        'currency' => 'USD',
        'items' => json_encode($items),
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
    ]);
}

function makePageView(Summit $summit, string $sessionId, Carbon $createdAt, string $type = 'optin'): void
{
    DB::table('visitor_sessions')->insertOrIgnore([
        'id' => $sessionId,
        'created_at' => $createdAt,
    ]);

    PageView::factory()->create([
        'summit_id' => $summit->id,
        'page_type' => $type,
        'visitor_session_id' => $sessionId,
        'created_at' => $createdAt,
    ]);
}

it('returns the 8 KPI tiles with the expected shape', function () {
    $summit = Summit::factory()->create([
        'pre_summit_starts_at' => now()->subDays(20),
        'ends_at' => now()->addDays(10),
    ]);

    makeOrder($summit, 10000, now()->subDays(2), [
        ['product_id' => null, 'kind' => 'main', 'qty' => 1, 'unit_price_cents' => 8000],
        ['product_id' => null, 'kind' => 'bump', 'qty' => 1, 'unit_price_cents' => 2000],
    ]);

    makePageView($summit, (string) Str::uuid(), now()->subDays(2));
    makePageView($summit, (string) Str::uuid(), now()->subDays(1));

    $service = app(SummitAnalytics::class);
    $overview = $service->overview($summit);

    expect(array_keys($overview))->toEqualCanonicalizing([
        'revenue', 'orders', 'visitors', 'contacts',
        'order_bumps_revenue', 'one_click_upsells_revenue',
        'average_order_value', 'revenue_per_visit',
    ]);

    foreach ($overview as $tile) {
        expect($tile)->toHaveKeys(['value', 'comparison', 'delta_pct', 'till', 'format']);
    }

    expect($overview['revenue']['value'])->toBe(100.0);
    expect($overview['orders']['value'])->toBe(1);
    expect($overview['visitors']['value'])->toBe(2);
    expect($overview['order_bumps_revenue']['value'])->toBe(20.0);
    expect($overview['average_order_value']['value'])->toBe(100.0);
    expect($overview['revenue_per_visit']['value'])->toBe(50.0);
});

it('computes delta_pct against the prior window', function () {
    $summit = Summit::factory()->create([
        'pre_summit_starts_at' => now()->subDays(10),
        'ends_at' => now()->addDays(10),
    ]);

    $service = app(SummitAnalytics::class);

    // Window: last 4 days. Prior window: 4 days before that.
    $from = now()->subDays(3)->startOfDay();
    $to = now()->endOfDay();
    $priorFrom = now()->subDays(7);

    // Current = $200, prior = $100 -> +100%
    makeOrder($summit, 20000, now()->subDay());
    makeOrder($summit, 10000, $priorFrom->copy()->addDay());

    $overview = $service->overview($summit, $from, $to);

    expect($overview['revenue']['value'])->toBe(200.0)
        ->and($overview['revenue']['comparison'])->toBe(100.0)
        ->and($overview['revenue']['delta_pct'])->toBe(100.0);
});

it('returns null delta when both periods are zero', function () {
    $summit = Summit::factory()->create();
    $overview = app(SummitAnalytics::class)->overview($summit);

    expect($overview['revenue']['delta_pct'])->toBeNull()
        ->and($overview['revenue']['value'])->toBe(0.0);
});
