<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitSpeaker;

it('resolves a funnel by summit slug + funnel slug + step slug', function () {
    $summit = Summit::factory()->create([
        'slug' => 'test-summit',
        'title' => 'Test Summit',
        'starts_at' => '2026-05-01 00:00:00',
        'ends_at' => '2026-05-03 23:59:59',
    ]);
    $funnel = Funnel::factory()->for($summit)->create(['slug' => 'main']);
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'slug' => 'optin',
        'content' => [],
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

it('computes speaker day_number from presentation_day', function () {
    $summit = Summit::factory()->create(['slug' => 'day-test', 'starts_at' => '2026-05-01']);
    $funnel = Funnel::factory()->for($summit)->create(['slug' => 'main']);
    FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'slug' => 'optin', 'content' => []]);
    $speaker = Speaker::factory()->create();
    SummitSpeaker::factory()->create([
        'summit_id' => $summit->id,
        'speaker_id' => $speaker->id,
        'presentation_day' => '2026-05-03',
    ]);

    $response = $this->getJson('/api/funnels/resolve?summit_slug=day-test&funnel_slug=main&step_slug=optin');

    $response->assertOk()->assertJsonPath('speakers.0.dayNumber', 3);
});
