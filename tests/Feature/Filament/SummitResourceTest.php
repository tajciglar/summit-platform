<?php

use App\Filament\Resources\Summits\Pages\CreateSummit;
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

it('creates a summit', function () {
    livewire(CreateSummit::class)
        ->fillForm([
            'title' => 'Neutral Summit 2026',
            'slug' => 'neutral-2026',
            'status' => 'draft',
            'current_phase' => 'summit_starts',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $summit = Summit::firstWhere('slug', 'neutral-2026');
    expect($summit)->not->toBeNull();
});
