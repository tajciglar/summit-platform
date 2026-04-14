<?php

namespace Tests\Feature\LandingPage;

use App\Jobs\GenerateLandingPageBatchJob;
use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Services\LandingPageGenerator;
use Illuminate\Support\Facades\Queue;
use Mockery;

it('batch job creates N drafts and dispatches N version jobs', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 3,
        'status'        => 'queued',
    ]);

    (new GenerateLandingPageBatchJob($batch))->handle();

    expect(LandingPageDraft::where('batch_id', $batch->id)->count())->toBe(3);
    expect($batch->fresh()->status)->toBe('running');

    Queue::assertPushed(GenerateLandingPageVersionJob::class, 3);
});

it('batch job assigns sequential version numbers', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 2,
        'status'        => 'queued',
    ]);

    (new GenerateLandingPageBatchJob($batch))->handle();

    $numbers = LandingPageDraft::where('batch_id', $batch->id)
        ->orderBy('version_number')
        ->pluck('version_number')
        ->toArray();

    expect($numbers)->toEqual([1, 2]);
});

it('version job saves blocks and marks draft ready', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'running',
    ]);

    $draft = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'pending',
        'preview_token'  => \Illuminate\Support\Str::random(40),
    ]);

    $fakeBlocks = [
        ['id' => 'aaa', 'type' => 'HeroBlock', 'version' => 1, 'props' => ['headline' => 'Hi']],
    ];

    $generator = Mockery::mock(LandingPageGenerator::class);
    $generator->shouldReceive('generate')
        ->once()
        ->withArgs(fn ($s, $notes) => $s->id === $summit->id)
        ->andReturn($fakeBlocks);

    (new GenerateLandingPageVersionJob($draft))->handle($generator);

    $fresh = $draft->fresh();
    expect($fresh->status)->toBe('ready');
    expect($fresh->blocks)->toEqual($fakeBlocks);
});

it('version job marks draft failed on exception', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $batch = LandingPageBatch::create([
        'summit_id'     => $summit->id,
        'funnel_id'     => $funnel->id,
        'version_count' => 1,
        'status'        => 'running',
    ]);

    $draft = LandingPageDraft::create([
        'batch_id'       => $batch->id,
        'version_number' => 1,
        'status'         => 'pending',
        'preview_token'  => \Illuminate\Support\Str::random(40),
    ]);

    $generator = Mockery::mock(LandingPageGenerator::class);
    $generator->shouldReceive('generate')->andThrow(new \RuntimeException('API timeout'));

    $job = new GenerateLandingPageVersionJob($draft);

    expect(fn () => $job->handle($generator))->toThrow(\RuntimeException::class);

    $fresh = $draft->fresh();
    expect($fresh->status)->toBe('failed');
    expect($fresh->error_message)->toContain('API timeout');
});
