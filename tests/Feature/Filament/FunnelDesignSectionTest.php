<?php

use App\Filament\Resources\Funnels\Pages\ViewFunnel;
use App\Models\Domain;
use App\Models\Funnel;
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

it('shows the skin picker on View Funnel', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create();

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->assertSee('Skin')
        ->assertFormFieldExists('template_key');
});
