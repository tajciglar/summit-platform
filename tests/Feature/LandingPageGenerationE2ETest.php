<?php

use App\Enums\LandingPageDraftStatus;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use App\Services\Anthropic\AnthropicClient;
use App\Services\Templates\PublishDraftService;
use App\Services\Templates\TemplateRegistry;

it('runs the full generate → approve → publish flow', function () {
    // Registry fake — override with a minimal schema so any content with summit.name passes
    $this->mock(TemplateRegistry::class, function ($m) {
        $m->shouldReceive('allKeys')->andReturn(['ochre-ink']);
        $m->shouldReceive('exists')->with('ochre-ink')->andReturn(true);
        $m->shouldReceive('get')->with('ochre-ink')->andReturn([
            'key' => 'ochre-ink',
            'label' => 'Editorial',
            'thumbnail' => '/template-thumbs/ochre-ink.jpg',
            'tags' => ['editorial'],
            'jsonSchema' => [
                'type' => 'object',
                'required' => ['summit'],
                'properties' => [
                    'summit' => [
                        'type' => 'object',
                        'required' => ['name'],
                        'properties' => ['name' => ['type' => 'string', 'minLength' => 1]],
                    ],
                ],
            ],
        ]);
        $m->shouldReceive('supportsSections')->with('ochre-ink')->andReturn(false);
        $m->shouldReceive('supportsSectionEditing')->with('ochre-ink')->andReturn(false);
        $m->shouldReceive('supportedSections')->with('ochre-ink')->andReturn([]);
        $m->shouldReceive('defaultEnabledSections')->with('ochre-ink')->andReturn([]);
        $m->shouldReceive('defaultSalesSections')->with('ochre-ink')->andReturn([]);
    });

    // Anthropic mock — returns a valid JSON payload
    $this->mock(AnthropicClient::class, function ($m) {
        $m->shouldReceive('complete')
            ->andReturn([
                'text' => '{"summit":{"name":"Integration Summit"}}',
                'tokens' => 250,
            ]);
    });

    // Setup
    $summit = Summit::factory()->create(['title' => 'Integration Summit']);
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'page_content' => []]);
    Speaker::factory()->forSummit($summit)->create(['goes_live_at' => now()]);
    $user = User::factory()->create();

    // Kick off generation
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 1,
        'template_pool' => ['ochre-ink'],
        'status' => 'queued',
    ]);

    GenerateLandingPageBatchJob::dispatchSync($batch->id);

    $draft = LandingPageDraft::where('batch_id', $batch->id)->firstOrFail();
    expect($draft->status)->toBe(LandingPageDraftStatus::Ready);
    expect($draft->template_key)->toBe('ochre-ink');
    expect($draft->sections)->toEqual(['summit' => ['name' => 'Integration Summit']]);

    // Approve + publish
    $draft->update(['status' => LandingPageDraftStatus::Shortlisted]);
    app(PublishDraftService::class)->publish($draft, $user);

    // Verify live
    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");
    $response->assertOk();
    $response->assertJsonPath('template_key', 'ochre-ink');
    $response->assertJsonPath('content.summit.name', 'Integration Summit');
});
