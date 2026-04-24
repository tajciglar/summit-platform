<?php

use App\Enums\SummitAudience;
use App\Filament\Resources\Summits\Pages\CreateSummit;
use App\Filament\Resources\Summits\Pages\EditSummit;
use App\Models\Domain;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;

use function Pest\Livewire\livewire;

beforeEach(function () {
    // Bypass Filament Shield permission checks for tests.
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    // Filament multi-tenant resources require an active tenant for URL generation.
    $this->domain = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'test.localhost',
        'slug' => 'test-domain',
        'is_active' => true,
    ]);
    Filament::setTenant($this->domain);
});

it('exposes the audience form field on create', function () {
    livewire(CreateSummit::class)
        ->assertSuccessful()
        ->assertFormFieldExists('audience');
});

it('creates a summit with an audience', function () {
    livewire(CreateSummit::class)
        ->fillForm([
            'title' => 'ADHD Women Summit 2026',
            'slug' => 'adhd-women-2026',
            'status' => 'draft',
            'current_phase' => 'pre',
            'audience' => SummitAudience::AdhdWomen->value,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $summit = Summit::firstWhere('slug', 'adhd-women-2026');
    expect($summit)->not->toBeNull();
    expect($summit->audience)->toBe(SummitAudience::AdhdWomen);
});

it('allows creating a summit without an audience', function () {
    livewire(CreateSummit::class)
        ->fillForm([
            'title' => 'Neutral Summit 2026',
            'slug' => 'neutral-2026',
            'status' => 'draft',
            'current_phase' => 'pre',
            'audience' => null,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $summit = Summit::firstWhere('slug', 'neutral-2026');
    expect($summit)->not->toBeNull();
    expect($summit->audience)->toBeNull();
});

it('hydrates an existing summit audience into the edit form', function () {
    $summit = Summit::factory()->create([
        'audience' => SummitAudience::Menopause,
    ]);

    livewire(EditSummit::class, ['record' => $summit->getRouteKey()])
        ->assertFormSet([
            'audience' => SummitAudience::Menopause->value,
        ]);
});
