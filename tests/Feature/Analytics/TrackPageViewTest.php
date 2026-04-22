<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
