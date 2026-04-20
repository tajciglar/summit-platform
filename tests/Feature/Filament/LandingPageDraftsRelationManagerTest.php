<?php

use App\Enums\LandingPageDraftStatus;
use App\Filament\Resources\Funnels\Pages\EditFunnel;
use App\Filament\Resources\Funnels\RelationManagers\LandingPageDraftsRelationManager;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;

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
