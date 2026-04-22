<?php

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('returns 404 for unknown token', function () {
    $this->getJson('/api/landing-page-drafts/bad-token-xyz')
        ->assertStatus(404);
});

it('returns draft payload for a ready draft', function () {
    $summit = Summit::factory()->create(['title' => 'Test Summit']);
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    LandingPageDraft::create([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'status' => 'ready',
        'preview_token' => 'test-token-ready-1',
        'template_key' => 'ochre-ink',
        'sections' => ['hero' => ['headline' => 'Join us']],
        'enabled_sections' => ['hero'],
        'palette' => ['#000', '#fff'],
    ]);

    $this->getJson('/api/landing-page-drafts/test-token-ready-1')
        ->assertOk()
        ->assertJsonStructure([
            'template_key',
            'content',
            'enabled_sections',
            'palette',
            'speakers',
            'funnel_id',
            'wp_checkout_redirect_url',
            'status',
        ])
        ->assertJsonPath('template_key', 'ochre-ink')
        ->assertJsonPath('status', 'ready')
        ->assertJsonPath('content.hero.headline', 'Join us');
});
