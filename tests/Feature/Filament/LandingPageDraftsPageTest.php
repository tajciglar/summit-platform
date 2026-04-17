<?php

use App\Filament\Resources\Funnels\Pages\LandingPageDraftsPage;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('renders the drafts page without drafts', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    livewire(LandingPageDraftsPage::class, ['record' => $funnel->id])
        ->assertSuccessful()
        ->assertSee('No drafts yet');
});

it('lists visible drafts (excludes rejected + archived)', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 3, 'status' => 'running',
    ]);
    $ready = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1', 'sections' => [],
        'status' => 'ready', 'preview_token' => 't1',
    ]);
    $rejected = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 2,
        'template_key' => 'opus-v2', 'sections' => [],
        'status' => 'rejected', 'preview_token' => 't2',
    ]);
    $archived = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 3,
        'template_key' => 'opus-v1', 'sections' => [],
        'status' => 'archived', 'preview_token' => 't3',
    ]);

    $page = livewire(LandingPageDraftsPage::class, ['record' => $funnel->id])
        ->assertSuccessful();

    $drafts = $page->instance()->drafts;
    expect($drafts->count())->toBe(1);
    expect($drafts->first()->id)->toBe($ready->id);
});

it('approve action marks draft as shortlisted', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1', 'sections' => [],
        'status' => 'ready', 'preview_token' => 't1',
    ]);

    livewire(LandingPageDraftsPage::class, ['record' => $funnel->id])
        ->call('approve', $draft->id);

    expect($draft->fresh()->status)->toBe('shortlisted');
});

it('reject action marks draft as rejected', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1', 'sections' => [],
        'status' => 'ready', 'preview_token' => 't1',
    ]);

    livewire(LandingPageDraftsPage::class, ['record' => $funnel->id])
        ->call('reject', $draft->id);

    expect($draft->fresh()->status)->toBe('rejected');
});

it('polls every 3s while a draft is generating', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1', 'sections' => [],
        'status' => 'generating', 'preview_token' => 't1',
    ]);

    $page = livewire(LandingPageDraftsPage::class, ['record' => $funnel->id]);
    expect($page->instance()->getPollingInterval())->toBe('3s');
});

it('publish action calls PublishDraftService', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['summit' => ['name' => 'X']],
        'status' => 'shortlisted', 'preview_token' => 't1',
    ]);

    livewire(LandingPageDraftsPage::class, ['record' => $funnel->id])
        ->call('publish', $draft->id);

    expect($draft->fresh()->status)->toBe('published');
});
