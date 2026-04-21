<?php

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('returns draft content by preview token', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'ochre-ink',
        'sections' => ['summit' => ['name' => 'Preview']],
        'status' => 'ready',
        'preview_token' => 'tok-abc-123',
    ]);

    $response = $this->getJson('/api/landing-page-drafts/tok-abc-123');

    $response->assertOk();
    $response->assertJsonPath('template_key', 'ochre-ink');
    $response->assertJsonPath('content.summit.name', 'Preview');
    $response->assertJsonStructure(['speakers']);
    $response->assertJsonPath('status', 'ready');
    $response->assertJsonPath('funnel_id', $funnel->id);
});

it('returns 404 for unknown preview token', function () {
    $this->getJson('/api/landing-page-drafts/nope')->assertNotFound();
});
