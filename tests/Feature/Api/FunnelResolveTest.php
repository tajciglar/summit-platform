<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;

it('resolves a funnel by summit slug + funnel slug + step slug', function () {
    $summit = Summit::factory()->create([
        'slug' => 'test-summit',
        'title' => 'Test Summit',
        'ends_at' => '2026-05-03 23:59:59',
    ]);
    $funnel = Funnel::factory()->for($summit)->create(['slug' => 'main']);
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'slug' => 'optin',
        'page_content' => '{}',
    ]);

    $response = $this->getJson('/api/funnels/resolve?summit_slug=test-summit&funnel_slug=main&step_slug=optin');

    $response->assertOk()
        ->assertJsonPath('funnel.slug', 'main')
        ->assertJsonPath('step.type', 'optin')
        ->assertJsonPath('summit.title', 'Test Summit');
});

it('returns 404 for unknown summit slug', function () {
    $response = $this->getJson('/api/funnels/resolve?summit_slug=missing&funnel_slug=foo&step_slug=optin');
    $response->assertNotFound();
});

it('computes speaker day_number from goes_live_at', function () {
    $summit = Summit::factory()->create(['slug' => 'day-test', 'pre_summit_starts_at' => '2026-05-01']);
    $funnel = Funnel::factory()->for($summit)->create(['slug' => 'main']);
    FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'slug' => 'optin', 'page_content' => '{}']);
    Speaker::factory()->forSummit($summit)->create([
        'goes_live_at' => '2026-05-03 00:00:00',
    ]);

    $response = $this->getJson('/api/funnels/resolve?summit_slug=day-test&funnel_slug=main&step_slug=optin');

    $response->assertOk()->assertJsonPath('speakers.0.dayNumber', 3);
});
