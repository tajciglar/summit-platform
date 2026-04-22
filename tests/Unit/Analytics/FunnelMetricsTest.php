<?php

use App\Models\PageView;
use App\Models\Summit;
use App\Services\Analytics\FunnelMetrics;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
    PageView::factory()->count(10)->for($summit)->state(['page_type' => 'optin_submit'])->create();
    PageView::factory()->count(8)->for($summit)->state(['page_type' => 'sales'])->create();
    PageView::factory()->count(1)->for($summit)->state(['page_type' => 'checkout_click'])->create();

    $report = app(FunnelMetrics::class)->reportForSummit($summit);

    expect($report['conversions']['optin_to_submit'])->toEqualWithDelta(0.10, 0.001);
    expect($report['leaks'])->toEqualCanonicalizing(['optin_to_submit']);
});
