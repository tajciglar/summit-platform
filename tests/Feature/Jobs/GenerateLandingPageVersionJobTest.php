<?php

use App\Enums\LandingPageDraftStatus;
use App\Enums\SummitAudience;
use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
use App\Models\Summit;
use App\Services\Templates\AudiencePalettes;
use App\Services\Templates\TemplateFiller;

it('creates a draft with content from TemplateFiller', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    Speaker::factory()->for($summit)->create(['goes_live_at' => now()]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) use ($summit) {
        $m->shouldReceive('fill')
            ->once()
            ->andReturn([
                'content' => ['summit' => ['name' => $summit->title], 'hero' => ['headline' => 'H']],
                'tokens' => 300,
            ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::first();
    expect($draft->template_key)->toBe('opus-v1');
    expect($draft->sections)->toEqual(['summit' => ['name' => $summit->title], 'hero' => ['headline' => 'H']]);
    expect($draft->status)->toBe(LandingPageDraftStatus::Ready);
    expect($draft->token_count)->toBe(300);
    expect($draft->version_number)->toBe(1);
});

it('marks draft as failed when filler throws', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andThrow(new RuntimeException('oops'));
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::first();
    expect($draft->status)->toBe(LandingPageDraftStatus::Failed);
    expect($draft->error_message)->toContain('oops');
});

it('re-throws 429 rate-limit errors and keeps draft in generating state for retry', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andThrow(
            new RuntimeException('Anthropic API returned 429: rate_limit_error blah')
        );
    });

    expect(fn () => GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1))
        ->toThrow(RuntimeException::class);

    $draft = LandingPageDraft::first();
    expect($draft->status)->toBe(LandingPageDraftStatus::Generating);
    expect($draft->error_message)->toBeNull();
});

it('marks draft as failed on final 429 after all retries exhausted', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andThrow(
            new RuntimeException('Anthropic API returned 429: rate_limit_error blah')
        );
    });

    // Simulate being on the final attempt — the job's attempts() returns 4
    // via job->release() accounting, but for dispatchSync we trigger the
    // post-tries branch by maxing out tries to 1.
    $job = new GenerateLandingPageVersionJob($batch->id, 'opus-v1', 1);
    $job->tries = 1;

    dispatch_sync($job);

    $draft = LandingPageDraft::first();
    expect($draft->status)->toBe(LandingPageDraftStatus::Failed);
    expect($draft->error_message)->toContain('429');
});

it('seeds enabled_sections from defaultEnabledSections for opus-v1', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')
            ->once()
            ->andReturn([
                'content' => ['hero' => ['headline' => 'X']],
                'tokens' => 100,
            ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft)->not->toBeNull();
    expect($draft->status)->toBe(LandingPageDraftStatus::Ready);
    expect($draft->enabled_sections)
        ->toBeArray()
        ->toContain('hero')
        ->toContain('footer')
        ->toContain('faq');
    expect($draft->enabled_sections)->toHaveCount(10);
});

it('leaves enabled_sections null for legacy templates like opus-v2', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')
            ->once()
            ->andReturn([
                'content' => ['summit' => ['name' => 'Test Summit']],
                'tokens' => 100,
            ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v2', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft)->not->toBeNull();
    expect($draft->status)->toBe(LandingPageDraftStatus::Ready);
    expect($draft->enabled_sections)->toBeNull();
});

it('stores audience and palette on the draft when summit has audience', function () {
    $summit = Summit::factory()->create(['audience' => SummitAudience::AdhdWomen]);
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft)->not->toBeNull();
    expect($draft->audience)->toBe(SummitAudience::AdhdWomen);
    expect($draft->palette)->toBe(AudiencePalettes::PALETTES['adhd-women']);
});

it('stores audience from batch override when present (overrides summit default)', function () {
    $summit = Summit::factory()->create(['audience' => SummitAudience::Herbal]);
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
        'audience_override' => SummitAudience::Ai,
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->audience)->toBe(SummitAudience::Ai);
    expect($draft->palette)->toBe(AudiencePalettes::PALETTES['ai']);
});

it('stores NEUTRAL palette when summit has no audience', function () {
    $summit = Summit::factory()->create(['audience' => null]);
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->audience)->toBeNull();
    expect($draft->palette)->toBe(AudiencePalettes::NEUTRAL);
});
