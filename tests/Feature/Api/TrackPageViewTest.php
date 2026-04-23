<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\PageView;
use App\Models\Summit;

it('records a page_view for an allowed page_type', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin']);

    $this->postJson('/api/track/page-view', [
        'page_type' => 'optin',
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
    ])->assertNoContent();

    expect(PageView::count())->toBe(1);
    expect(PageView::first()->page_type)->toBe('optin');
});

it('rejects optin_submit — reserved for server-side only', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create();

    $this->postJson('/api/track/page-view', [
        'page_type' => 'optin_submit',
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
    ])->assertStatus(422);

    expect(PageView::count())->toBe(0);
});

it('validates required ids exist', function () {
    $this->postJson('/api/track/page-view', [
        'page_type' => 'optin',
        'summit_id' => '00000000-0000-0000-0000-000000000000',
        'funnel_id' => '00000000-0000-0000-0000-000000000000',
        'funnel_step_id' => '00000000-0000-0000-0000-000000000000',
    ])->assertStatus(422);
});

it('is publicly reachable without an internal bearer token', function () {
    // The tracker must accept browser POSTs; access control is via throttle only.
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create();

    $this->postJson('/api/track/page-view', [
        'page_type' => 'sales',
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
    ])->assertNoContent();
});
