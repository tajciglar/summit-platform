<?php

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('returns 404 for unknown token', function () {
    $this->getJson('/api/landing-page-drafts/bad-token-xyz')
        ->assertStatus(404);
});

it('returns 404 for non-ready draft', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'running',
    ]);

    LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'generating',
        'preview_token'  => 'test-token-generating',
    ]);

    $this->getJson('/api/landing-page-drafts/test-token-generating')
        ->assertStatus(404);
});

it('returns blocks and summit context for a ready draft', function () {
    $summit = Summit::factory()->create([
        'title'         => 'Test Summit',
        'description'   => 'Great summit.',
        'starts_at'     => '2026-06-01 00:00:00',
        'ends_at'       => '2026-06-05 00:00:00',
        'current_phase' => 'pre_summit',
    ]);

    $funnel = Funnel::factory()->create([
        'summit_id' => $summit->id,
        'theme'     => [],
    ]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'running',
    ]);

    $blocks = [
        ['id' => 'abc', 'type' => 'HeroBlock', 'version' => 1, 'props' => ['headline' => 'Join us']],
    ];

    LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'ready',
        'preview_token'  => 'test-token-ready-1',
        'blocks'         => $blocks,
    ]);

    $response = $this->getJson('/api/landing-page-drafts/test-token-ready-1');

    $response->assertOk()
        ->assertJsonPath('blocks.0.type', 'HeroBlock')
        ->assertJsonPath('summit.title', 'Test Summit')
        ->assertJsonStructure([
            'blocks',
            'summit' => ['id', 'title', 'description', 'starts_at', 'ends_at', 'current_phase'],
            'theme',
            'speakers',
            'products',
            'draft' => ['id', 'version_number', 'status'],
        ]);
});
