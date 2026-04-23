<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;

it('rejects server-side endpoints without a bearer token', function () {
    $this->getJson('/api/funnels/resolve?summit_slug=x&funnel_slug=y&step_slug=z')
        ->assertStatus(401);
});

it('rejects server-side endpoints with a wrong bearer token', function () {
    $this->withHeaders(['Authorization' => 'Bearer nope'])
        ->getJson('/api/funnels/resolve?summit_slug=x&funnel_slug=y&step_slug=z')
        ->assertStatus(401);
});

it('accepts public endpoints without a bearer token', function () {
    // Optin endpoint remains browser-facing; no auth required.
    $this->postJson('/api/optins', [])
        ->assertStatus(422); // validation error, not 401
});

it('allows published-content when token matches', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'ochre-ink', 'content' => []],
    ]);

    $this->withHeaders(withInternalApiToken())
        ->getJson("/api/funnels/{$funnel->id}/published-content")
        ->assertOk();
});
