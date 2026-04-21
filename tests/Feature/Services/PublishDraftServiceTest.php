<?php

use App\Enums\LandingPageDraftStatus;
use App\Enums\SummitAudience;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\FunnelStepRevision;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use App\Services\Templates\AudiencePalettes;
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
        'funnel_step_id' => $step->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'ochre-ink',
        'sections' => ['summit' => ['name' => 'New']],
        'enabled_sections' => ['hero', 'faq'],
        'audience' => SummitAudience::AdhdWomen,
        'palette' => AudiencePalettes::PALETTES['adhd-women'],
        'status' => 'ready',
        'preview_token' => 'tok',
    ]);
    $user = User::factory()->create();

    app(PublishDraftService::class)->publish($draft, $user);

    $step->refresh();
    expect($step->page_content)->toEqual([
        'template_key' => 'ochre-ink',
        'content' => ['summit' => ['name' => 'New']],
        'enabled_sections' => ['hero', 'faq'],
        'audience' => 'adhd-women',
        'palette' => AudiencePalettes::PALETTES['adhd-women'],
    ]);

    expect(FunnelStepRevision::count())->toBe(1);
    $rev = FunnelStepRevision::first();
    expect($rev->page_content_snapshot)->toEqual(['template_key' => 'old', 'content' => ['a' => 1]]);
    expect($rev->published_by)->toBe($user->id);

    expect($draft->fresh()->status)->toBe(LandingPageDraftStatus::Published);
});

it('archives previously-published drafts for the same funnel', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'page_content' => []]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 2, 'status' => 'running',
    ]);
    $old = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1, 'template_key' => 'ochre-ink',
        'sections' => [], 'status' => 'published', 'preview_token' => 't1',
    ]);
    $new = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 2, 'template_key' => 'lime-ink',
        'sections' => [], 'status' => 'ready', 'preview_token' => 't2',
    ]);

    app(PublishDraftService::class)->publish($new, User::factory()->create());

    expect($old->fresh()->status)->toBe(LandingPageDraftStatus::Archived);
    expect($new->fresh()->status)->toBe(LandingPageDraftStatus::Published);
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
        'funnel_step_id' => $step->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1, 'template_key' => 'ochre-ink',
        'sections' => ['x' => 1], 'status' => 'ready', 'preview_token' => 't',
    ]);

    app(PublishDraftService::class)->publish($draft, User::factory()->create());

    expect(FunnelStepRevision::count())->toBe(0);
    expect($step->fresh()->page_content)->toEqual([
        'template_key' => 'ochre-ink',
        'content' => ['x' => 1],
        'enabled_sections' => null,
        'audience' => null,
        'palette' => null,
    ]);
});

it('snapshots null audience + null palette when draft has no audience', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin']);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'funnel_step_id' => $step->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'ochre-ink',
        'sections' => ['hero' => ['headline' => 'X']],
        'enabled_sections' => ['hero', 'footer'],
        'audience' => null,
        'palette' => null,
        'status' => 'ready',
        'preview_token' => 'tok-null-audience',
    ]);

    app(PublishDraftService::class)->publish($draft, User::factory()->create());

    $page = $step->fresh()->page_content;
    expect($page['audience'])->toBeNull();
    expect($page['palette'])->toBeNull();
});
