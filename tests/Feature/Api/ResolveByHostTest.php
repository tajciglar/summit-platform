<?php

use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;

beforeEach(fn () => test()->withHeaders(withInternalApiToken()));

function seedHostFixture(string $hostname, string $funnelSlug, string $stepSlug = 'optin', string $stepType = 'optin', string $templateKey = 'cream-sage'): FunnelStep
{
    $domain = Domain::factory()->create([
        'hostname' => $hostname,
        'is_active' => true,
    ]);
    $summit = Summit::factory()->create([
        'slug' => $hostname.'-summit',
        'domain_id' => $domain->id,
        'ends_at' => '2030-01-01 00:00:00',
    ]);
    $funnel = Funnel::factory()->for($summit)->create([
        'slug' => $funnelSlug,
        'is_active' => true,
    ]);

    return FunnelStep::factory()->for($funnel)->create([
        'slug' => $stepSlug,
        'step_type' => $stepType,
        'is_published' => true,
        'page_content' => [
            'template_key' => $templateKey,
            'content' => ['hero' => ['headlineLead' => 'Hello']],
        ],
    ]);
}

it('resolves a funnel by exact hostname + funnel slug', function () {
    seedHostFixture('example.com', 'aps');

    $response = $this->getJson('/api/funnels/resolve-by-host?host=example.com&funnel=aps');

    $response->assertOk()
        ->assertJsonPath('template_key', 'cream-sage')
        ->assertJsonPath('content.hero.headlineLead', 'Hello');
});

it('strips www. from the host header', function () {
    seedHostFixture('example.com', 'aps');

    $response = $this->getJson('/api/funnels/resolve-by-host?host=www.example.com&funnel=aps');

    $response->assertOk();
});

it('resolves an explicit step slug', function () {
    $step = seedHostFixture('example.com', 'aps');
    // Add a second step for the same funnel.
    FunnelStep::factory()->for($step->funnel)->create([
        'slug' => 'vip',
        'step_type' => 'sales_page',
        'is_published' => true,
        'page_content' => [
            'template_key' => 'cream-sage',
            'content' => ['salesHero' => ['headline' => 'Upgrade']],
        ],
    ]);

    $response = $this->getJson('/api/funnels/resolve-by-host?host=example.com&funnel=aps&step=vip');

    $response->assertOk()
        ->assertJsonPath('content.salesHero.headline', 'Upgrade');
});

it('404s for an unknown hostname', function () {
    $response = $this->getJson('/api/funnels/resolve-by-host?host=unknown.example&funnel=aps');

    $response->assertNotFound();
});

it('404s for a funnel slug that does not belong to the hostname', function () {
    seedHostFixture('example.com', 'aps');

    $response = $this->getJson('/api/funnels/resolve-by-host?host=example.com&funnel=not-mine');

    $response->assertNotFound();
});

it('422s when host or funnel is missing', function () {
    $response = $this->getJson('/api/funnels/resolve-by-host?host=example.com');
    $response->assertStatus(422);
});

it('ignores inactive funnels', function () {
    $step = seedHostFixture('example.com', 'aps');
    $step->funnel->update(['is_active' => false]);

    $response = $this->getJson('/api/funnels/resolve-by-host?host=example.com&funnel=aps');

    $response->assertNotFound();
});

it('ignores inactive domains', function () {
    $step = seedHostFixture('example.com', 'aps');
    Domain::where('hostname', 'example.com')->update(['is_active' => false]);

    $response = $this->getJson('/api/funnels/resolve-by-host?host=example.com&funnel=aps');

    $response->assertNotFound();
});
