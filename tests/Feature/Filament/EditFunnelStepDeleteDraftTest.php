<?php

use App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
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

it('can delete a draft from the edit funnel step page', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->create([
        'funnel_id' => $funnel->id,
        'slug' => 'optin',
    ]);
    $batch = LandingPageBatch::factory()->create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'status' => 'running',
    ]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => 'ready',
    ]);

    livewire(EditFunnelStep::class, ['record' => $step->id])
        ->call('deleteDraft', $draft->id)
        ->assertNotified();

    expect(LandingPageDraft::find($draft->id))->toBeNull();
});
