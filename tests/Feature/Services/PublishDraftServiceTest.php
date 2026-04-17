<?php

use App\Models\{FunnelStep, FunnelStepRevision, LandingPageBatch, LandingPageDraft, Summit, Funnel, User};
use App\Services\Templates\PublishDraftService;

it('writes template_key + content to the optin step and snapshots the previous content', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'old', 'content' => ['a' => 1]],
    ]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['summit' => ['name' => 'New']],
        'status' => 'ready',
        'preview_token' => 'tok',
    ]);
    $user = User::factory()->create();

    app(PublishDraftService::class)->publish($draft, $user);

    $step->refresh();
    expect($step->page_content)->toEqual([
        'template_key' => 'opus-v1',
        'content' => ['summit' => ['name' => 'New']],
    ]);

    expect(FunnelStepRevision::count())->toBe(1);
    $rev = FunnelStepRevision::first();
    expect($rev->page_content_snapshot)->toEqual(['template_key' => 'old', 'content' => ['a' => 1]]);
    expect($rev->published_by)->toBe($user->id);

    expect($draft->fresh()->status)->toBe('published');
});

it('archives previously-published drafts for the same funnel', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'page_content' => []]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 2, 'status' => 'running',
    ]);
    $old = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1, 'template_key' => 'opus-v1',
        'sections' => [], 'status' => 'published', 'preview_token' => 't1',
    ]);
    $new = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 2, 'template_key' => 'opus-v2',
        'sections' => [], 'status' => 'ready', 'preview_token' => 't2',
    ]);

    app(PublishDraftService::class)->publish($new, User::factory()->create());

    expect($old->fresh()->status)->toBe('archived');
    expect($new->fresh()->status)->toBe('published');
});

it('skips snapshot when page_content is empty', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1, 'template_key' => 'opus-v1',
        'sections' => ['x' => 1], 'status' => 'ready', 'preview_token' => 't',
    ]);

    app(PublishDraftService::class)->publish($draft, User::factory()->create());

    expect(FunnelStepRevision::count())->toBe(0);
    expect($step->fresh()->page_content)->toEqual([
        'template_key' => 'opus-v1',
        'content' => ['x' => 1],
    ]);
});
