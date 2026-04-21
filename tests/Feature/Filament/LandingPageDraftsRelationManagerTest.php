<?php

use App\Enums\LandingPageDraftStatus;
use App\Enums\SummitAudience;
use App\Filament\Resources\Funnels\Pages\EditFunnel;
use App\Filament\Resources\Funnels\RelationManagers\LandingPageDraftsRelationManager;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->tenant = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'test.localhost',
        'slug' => 'test-domain',
        'is_active' => true,
    ]);
    Filament::setTenant($this->tenant);
});

it('lists drafts belonging to the funnel', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    $myBatch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $otherBatch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $otherFunnel->id]);

    $mine = LandingPageDraft::factory()->create(['batch_id' => $myBatch->id]);
    $theirs = LandingPageDraft::factory()->create(['batch_id' => $otherBatch->id]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->assertCanSeeTableRecords([$mine])
        ->assertCanNotSeeTableRecords([$theirs]);
});

it('delete row action removes draft', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => LandingPageDraftStatus::Ready,
    ]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->callTableAction('delete', $draft);

    expect(LandingPageDraft::find($draft->id))->toBeNull();
});

it('publish action is hidden when status is not publishable', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => LandingPageDraftStatus::Generating,
    ]);

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->assertTableActionHidden('publish', $draft);

});

it('generate action creates batch and dispatches job', function () {
    Queue::fake();

    $summit = Summit::factory()->create([
        'audience' => SummitAudience::AdhdParenting,
    ]);
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

    // Mount the action, then set state + call to work around Filament Repeater
    // UUID-key mismatch in callAction(data: ...) when using nested Select fields.
    $uuid1 = (string) Str::uuid();
    $uuid2 = (string) Str::uuid();

    livewire(LandingPageDraftsRelationManager::class, [
        'ownerRecord' => $funnel,
        'pageClass' => EditFunnel::class,
    ])
        ->mountAction(TestAction::make('generate')->table())
        ->set('mountedActions.0.data.audience_override', SummitAudience::AdhdParenting->value)
        ->set('mountedActions.0.data.style_reference_url', 'https://parenting-summits.com')
        ->set('mountedActions.0.data.template_selections', [
            $uuid1 => ['template_key' => 'ochre-ink', 'count' => '2'],
            $uuid2 => ['template_key' => 'lime-ink', 'count' => '1'],
        ])
        ->callMountedAction()
        ->assertHasNoActionErrors();

    $batch = LandingPageBatch::where('funnel_id', $funnel->id)->first();
    expect($batch)->not->toBeNull();
    expect($batch->versions_per_template)->toBe(['ochre-ink' => 2, 'lime-ink' => 1]);
    expect($batch->style_reference_url)->toBe('https://parenting-summits.com');
    Queue::assertPushed(GenerateLandingPageBatchJob::class);
});
