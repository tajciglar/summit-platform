<?php

use App\Enums\LandingPageDraftStatus;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('drafts relation returns drafts through batch', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create(['funnel_id' => $funnel->id, 'summit_id' => $summit->id]);
    $draft = LandingPageDraft::factory()->create(['batch_id' => $batch->id]);

    expect($funnel->drafts->contains($draft))->toBeTrue();
});

it('drafts relation scopes to correct funnel', function () {
    $summit = Summit::factory()->create();
    $funnelA = Funnel::factory()->create(['summit_id' => $summit->id]);
    $funnelB = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batchA = LandingPageBatch::factory()->create(['funnel_id' => $funnelA->id, 'summit_id' => $summit->id]);
    $batchB = LandingPageBatch::factory()->create(['funnel_id' => $funnelB->id, 'summit_id' => $summit->id]);
    $draftA = LandingPageDraft::factory()->create(['batch_id' => $batchA->id]);
    $draftB = LandingPageDraft::factory()->create(['batch_id' => $batchB->id]);

    expect($funnelA->drafts->contains($draftA))->toBeTrue();
    expect($funnelA->drafts->contains($draftB))->toBeFalse();
});

it('published draft returns most recent published', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create(['funnel_id' => $funnel->id, 'summit_id' => $summit->id]);

    LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'status' => LandingPageDraftStatus::Ready,
    ]);
    $older = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'version_number' => 2,
        'status' => LandingPageDraftStatus::Published,
        'updated_at' => now()->subDay(),
    ]);
    $newest = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'version_number' => 3,
        'status' => LandingPageDraftStatus::Published,
        'updated_at' => now(),
    ]);

    expect($funnel->publishedDraft()->first()->is($newest))->toBeTrue();
});
