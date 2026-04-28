<?php

use App\Enums\LandingPageDraftStatus;
use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use App\Services\Templates\TemplateFiller;

it('creates a draft with content from TemplateFiller', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    Speaker::factory()->forSummit($summit, day: 1)->create();
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

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

    $draft = LandingPageDraft::first();
    expect($draft->template_key)->toBe('ochre-ink');
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

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

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

    expect(fn () => GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1))
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
    $job = new GenerateLandingPageVersionJob($batch->id, 'ochre-ink', 1);
    $job->tries = 1;

    dispatch_sync($job);

    $draft = LandingPageDraft::first();
    expect($draft->status)->toBe(LandingPageDraftStatus::Failed);
    expect($draft->error_message)->toContain('429');
});

it('seeds enabled_sections from defaultEnabledSections for ochre-ink', function () {
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

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

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

it('uses funnel section_config for the step_type when present', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create([
        'template_key' => 'ochre-ink',
        'section_config' => [
            'optin' => ['hero', 'speakers-by-day', 'closing-cta', 'footer'],
            'sales_page' => ['stats-hero', 'value-prop', 'testimonials-attendees', 'faq', 'closing-cta', 'footer'],
            'thank_you' => ['hero', 'closing-cta', 'footer'],
        ],
    ]);
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin']);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
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

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->enabled_sections)->toEqual(['hero', 'speakers-by-day', 'closing-cta', 'footer']);
});

it('falls back to template defaults when funnel section_config lacks this step_type', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create([
        'template_key' => 'ochre-ink',
        'section_config' => ['optin' => ['hero', 'footer']],
    ]);
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'sales_page']);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->once()->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->enabled_sections)->toBeArray()->toHaveCount(10);
});

it('filters section_config entries down to sections the template actually supports', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create([
        'template_key' => 'ochre-ink',
        'section_config' => [
            'optin' => ['hero', 'bogus-section', 'footer'],
        ],
    ]);
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin']);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->once()->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->enabled_sections)->toEqual(['hero', 'footer']);
});

it('auto-publishes the draft into the funnel step when batch.auto_publish is true', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create(['template_key' => 'ochre-ink']);
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);
    $user = User::factory()->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 1,
        'status' => 'running',
        'auto_publish' => true,
        'published_by_user_id' => $user->id,
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')
            ->once()
            ->andReturn([
                'content' => ['hero' => ['headline' => 'Auto-published']],
                'tokens' => 100,
            ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->status)->toBe(LandingPageDraftStatus::Published);

    $step->refresh();
    expect($step->page_content)
        ->toHaveKey('template_key', 'ochre-ink')
        ->and($step->page_content['content'])->toEqual(['hero' => ['headline' => 'Auto-published']]);
});

it('does not auto-publish when batch.auto_publish is false', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create(['template_key' => 'ochre-ink']);
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->once()->andReturn([
            'content' => ['hero' => ['headline' => 'X']],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'ochre-ink', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->status)->toBe(LandingPageDraftStatus::Ready);

    $step->refresh();
    expect($step->page_content)->toEqual([]);
});
