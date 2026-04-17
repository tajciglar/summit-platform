<?php

use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
use App\Models\Summit;
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
    expect($draft->status)->toBe('ready');
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
        $m->shouldReceive('fill')->andThrow(new \RuntimeException('oops'));
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::first();
    expect($draft->status)->toBe('failed');
    expect($draft->error_message)->toContain('oops');
});
