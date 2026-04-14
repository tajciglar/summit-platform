<?php

namespace Tests\Feature\LandingPage;

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('can create a batch with drafts', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 3,
        'status'        => 'queued',
        'notes'         => 'Focus on ADHD parents.',
    ]);

    $draft = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'pending',
        'preview_token'  => \Illuminate\Support\Str::random(40),
    ]);

    expect($batch->fresh()->drafts)->toHaveCount(1);
    expect($draft->fresh()->batch->id)->toBe($batch->id);
    expect($draft->fresh()->preview_token)->toHaveLength(40);
});

it('draft stores blocks as array cast', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch  = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'queued',
    ]);

    $blocks = [
        ['id' => 'abc', 'type' => 'HeroBlock', 'version' => 1, 'props' => ['headline' => 'Hello']],
    ];

    $draft = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'ready',
        'preview_token'  => \Illuminate\Support\Str::random(40),
        'blocks'         => $blocks,
    ]);

    expect($draft->fresh()->blocks)->toEqual($blocks);
});
