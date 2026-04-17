<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;

it('returns the published page_content for an optin step', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [
            'template_key' => 'opus-v1',
            'content' => ['summit' => ['name' => 'Test']],
        ],
    ]);

    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");

    $response->assertOk();
    $response->assertJsonPath('template_key', 'opus-v1');
    $response->assertJsonPath('content.summit.name', 'Test');
    $response->assertJsonStructure(['speakers']);
});

it('returns 404 when funnel has no optin step with content', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $this->getJson("/api/funnels/{$funnel->id}/published-content")
        ->assertNotFound();
});

it('includes speaker summary in camelCase', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'opus-v1', 'content' => []],
    ]);
    $speaker = Speaker::factory()->for($summit)->create(['goes_live_at' => now()]);

    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");

    $response->assertOk();
    $response->assertJsonPath('speakers.0.id', $speaker->id);
    $response->assertJsonPath('speakers.0.firstName', $speaker->first_name);
    $response->assertJsonStructure(['speakers' => [['id', 'firstName', 'lastName', 'title', 'photoUrl', 'goesLiveAt']]]);
});
