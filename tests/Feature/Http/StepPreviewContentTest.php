<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;

beforeEach(fn () => test()->withHeaders(withInternalApiToken()));

it('returns page_content for any step by id (including non-optin)', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'upsell',
        'page_content' => [
            'template_key' => 'indigo-gold',
            'content' => ['hero' => ['title' => 'Upgrade to VIP']],
            'enabled_sections' => ['hero'],
            'palette' => ['primary' => '#000'],
        ],
    ]);

    $response = $this->getJson("/api/funnel-steps/{$step->id}/preview-content");

    $response->assertOk();
    $response->assertJsonPath('template_key', 'indigo-gold');
    $response->assertJsonPath('content.hero.title', 'Upgrade to VIP');
    $response->assertJsonPath('enabled_sections.0', 'hero');
    $response->assertJsonPath('palette.primary', '#000');
    $response->assertJsonPath('funnel_id', $funnel->id);
    $response->assertJsonStructure(['speakers']);
});

it('returns 404 when step has no template_key in page_content', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['page_content' => []]);

    $this->getJson("/api/funnel-steps/{$step->id}/preview-content")
        ->assertNotFound();
});

it('returns 404 when step id does not exist', function () {
    $this->getJson('/api/funnel-steps/019aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/preview-content')
        ->assertNotFound();
});

it('includes summit speakers in camelCase', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create([
        'page_content' => ['template_key' => 'indigo-gold', 'content' => []],
    ]);
    $speaker = Speaker::factory()->forSummit($summit)->create();

    $response = $this->getJson("/api/funnel-steps/{$step->id}/preview-content");

    $response->assertOk();
    $response->assertJsonPath('speakers.0.id', $speaker->id);
    $response->assertJsonPath('speakers.0.firstName', $speaker->first_name);
    $response->assertJsonStructure(['speakers' => [['id', 'firstName', 'lastName', 'title', 'photoUrl']]]);
});
