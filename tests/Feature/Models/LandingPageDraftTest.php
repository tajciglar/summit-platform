<?php

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('casts enabled_sections to array', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'template_key' => 'ochre-ink',
        'sections' => ['hero' => ['headline' => 'X']],
        'enabled_sections' => ['hero', 'footer'],
        'status' => 'ready',
        'preview_token' => 'test-token',
    ]);

    expect($draft->fresh()->enabled_sections)
        ->toBeArray()
        ->toBe(['hero', 'footer']);
});

it('allows null enabled_sections for legacy drafts', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'template_key' => 'lime-ink',
        'sections' => ['hero' => ['headline' => 'Y']],
        'enabled_sections' => null,
        'status' => 'ready',
        'preview_token' => 'test-token-2',
    ]);

    expect($draft->fresh()->enabled_sections)->toBeNull();
});
