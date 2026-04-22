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
            'template_key' => 'ochre-ink',
            'content' => ['summit' => ['name' => 'Test']],
        ],
    ]);

    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");

    $response->assertOk();
    $response->assertJsonPath('template_key', 'ochre-ink');
    $response->assertJsonPath('content.summit.name', 'Test');
    $response->assertJsonStructure(['speakers']);
    $response->assertJsonPath('funnel_id', $funnel->id);
});

it('returns 404 when funnel has no optin step with content', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $this->getJson("/api/funnels/{$funnel->id}/published-content")
        ->assertNotFound();
});

it('surfaces the funnel wp_checkout_redirect_url when set', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create([
        'wp_checkout_redirect_url' => 'https://althea-academy.com/checkout/abc',
    ]);
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'ochre-ink', 'content' => []],
    ]);

    $this->getJson("/api/funnels/{$funnel->id}/published-content")
        ->assertOk()
        ->assertJsonPath('wp_checkout_redirect_url', 'https://althea-academy.com/checkout/abc');
});

it('returns null wp_checkout_redirect_url when funnel has no redirect', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'ochre-ink', 'content' => []],
    ]);

    $this->getJson("/api/funnels/{$funnel->id}/published-content")
        ->assertOk()
        ->assertJsonPath('wp_checkout_redirect_url', null);
});

it('falls back to funnel.section_config for enabled_sections when step has none', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create([
        'template_key' => 'indigo-gold',
        'section_config' => [
            'optin' => ['hero', 'press'],
            'sales_page' => ['sales-hero', 'price-card'],
        ],
    ]);
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'sales_page',
        'page_content' => [
            'template_key' => 'indigo-gold',
            'content' => ['salesHero' => ['headline' => 'VIP']],
        ],
    ]);

    $this->getJson("/api/funnels/{$funnel->id}/published-content?step_type=sales_page")
        ->assertOk()
        ->assertJsonPath('enabled_sections', ['sales-hero', 'price-card']);
});

it('includes speaker summary in camelCase', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'ochre-ink', 'content' => []],
    ]);
    $speaker = Speaker::factory()->for($summit)->create(['goes_live_at' => now()]);

    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");

    $response->assertOk();
    $response->assertJsonPath('speakers.0.id', $speaker->id);
    $response->assertJsonPath('speakers.0.firstName', $speaker->first_name);
    $response->assertJsonStructure(['speakers' => [['id', 'firstName', 'lastName', 'title', 'photoUrl', 'goesLiveAt']]]);
});
