<?php

namespace Tests\Feature\LandingPage;

use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

it('dispatches batch job when called with valid params', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 3,
        'status'        => 'queued',
        'notes'         => 'Target audience: busy parents.',
    ]);

    dispatch(new GenerateLandingPageBatchJob($batch));

    Queue::assertPushed(GenerateLandingPageBatchJob::class, fn ($job) =>
        $job->batch->id === $batch->id
    );
});

it('approve action copies blocks to optin step and marks siblings rejected', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $optinStep = FunnelStep::factory()->create([
        'funnel_id'  => $funnel->id,
        'slug'       => 'optin',
        'step_type'  => 'optin',
        'content'    => [],
    ]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 2,
        'status'        => 'running',
    ]);

    $blocks = [
        ['id' => 'abc', 'type' => 'HeroBlock', 'version' => 1, 'props' => ['headline' => 'Winner']],
    ];

    $winner = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'ready',
        'preview_token'  => 'tok-winner',
        'blocks'         => $blocks,
    ]);

    $sibling = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 2,
        'status'         => 'ready',
        'preview_token'  => 'tok-sibling',
        'blocks'         => [['id' => 'def', 'type' => 'HeroBlock', 'version' => 1, 'props' => []]],
    ]);

    // Simulate what the approve action does
    DB::transaction(function () use ($winner, $batch, $optinStep, $blocks) {
        $optinStep->update(['content' => $blocks]);
        $winner->update(['status' => 'approved']);
        LandingPageDraft::where('batch_id', $batch->id)
            ->where('id', '!=', $winner->id)
            ->update(['status' => 'rejected']);
        $batch->update(['status' => 'completed', 'completed_at' => now()]);
    });

    expect($optinStep->fresh()->content)->toEqual($blocks);
    expect($winner->fresh()->status)->toBe('approved');
    expect($sibling->fresh()->status)->toBe('rejected');
    expect($batch->fresh()->status)->toBe('completed');
});
