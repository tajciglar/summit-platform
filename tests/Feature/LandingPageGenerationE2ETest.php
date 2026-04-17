<?php

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
        $m->shouldReceive('allKeys')->andReturn(['opus-v1']);
        $m->shouldReceive('exists')->with('opus-v1')->andReturn(true);
        $m->shouldReceive('get')->with('opus-v1')->andReturn([
            'key' => 'opus-v1',
            'label' => 'Editorial',
            'thumbnail' => '/template-thumbs/opus-v1.jpg',
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
    FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'page_content' => []]);
    Speaker::factory()->for($summit)->create(['goes_live_at' => now()]);
    $user = User::factory()->create();

    // Kick off generation
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'template_pool' => ['opus-v1'],
        'status' => 'queued',
    ]);

    GenerateLandingPageBatchJob::dispatchSync($batch->id);

    $draft = LandingPageDraft::where('batch_id', $batch->id)->firstOrFail();
    expect($draft->status)->toBe('ready');
    expect($draft->template_key)->toBe('opus-v1');
    expect($draft->sections)->toEqual(['summit' => ['name' => 'Integration Summit']]);

    // Approve + publish
    $draft->update(['status' => 'shortlisted']);
    app(PublishDraftService::class)->publish($draft, $user);

    // Verify live
    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");
    $response->assertOk();
    $response->assertJsonPath('template_key', 'opus-v1');
    $response->assertJsonPath('content.summit.name', 'Integration Summit');
});
