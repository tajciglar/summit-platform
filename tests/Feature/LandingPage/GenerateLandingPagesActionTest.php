<?php

namespace Tests\Feature\LandingPage;

use App\Filament\Resources\Summits\Pages\ManageLandingPageBatches;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Support\Facades\Queue;

it('dispatches batch job when invoked', function () {
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

it('approveDraft copies blocks to optin step and marks siblings rejected', function () {
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

    // Instantiate the page and set the record directly
    $page = new ManageLandingPageBatches();
    $page->record = $summit;

    $page->approveDraft($winner->id);

    expect($optinStep->fresh()->content)->toEqual($blocks);
    expect($winner->fresh()->status)->toBe('approved');
    expect($sibling->fresh()->status)->toBe('rejected');
    expect($batch->fresh()->status)->toBe('completed');
});

it('approveDraft does not re-approve an already-approved draft', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'completed', // batch already done
    ]);

    $draft = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'approved', // already approved
        'preview_token'  => 'tok-already',
        'blocks'         => [],
    ]);

    $page = new ManageLandingPageBatches();
    $page->record = $summit;

    // Should return early without throwing
    $page->approveDraft($draft->id);

    // Status should remain approved (not changed)
    expect($draft->fresh()->status)->toBe('approved');
});

it('rejectDraft does not reject an already-approved draft', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'completed',
    ]);

    $draft = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'approved',
        'preview_token'  => 'tok-approved',
        'blocks'         => [],
    ]);

    $page = new ManageLandingPageBatches();
    $page->record = $summit;

    $page->rejectDraft($draft->id);

    // Status must remain approved — guard fired
    expect($draft->fresh()->status)->toBe('approved');
});
