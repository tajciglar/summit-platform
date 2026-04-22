<?php

use App\Filament\Resources\Speakers\Pages\CreateSpeaker;
use App\Filament\Resources\Speakers\Pages\ListSpeakers;
use App\Models\Domain;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->domain = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'speakers-test.localhost',
        'slug' => 'speakers-test',
        'is_active' => true,
    ]);
    Filament::setTenant($this->domain);

    $this->summitA = Summit::factory()->create(['title' => 'Summit A', 'domain_id' => $this->domain->id]);
    $this->summitB = Summit::factory()->create(['title' => 'Summit B', 'domain_id' => $this->domain->id]);
});

it('persists day_number when creating a speaker', function () {
    livewire(CreateSpeaker::class)
        ->fillForm([
            'summit_id' => $this->summitA->id,
            'slug' => 'jane-doe',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'day_number' => 2,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $speaker = Speaker::firstWhere('slug', 'jane-doe');
    expect($speaker)->not->toBeNull();
    expect($speaker->day_number)->toBe(2);
    expect($speaker->summit_id)->toBe($this->summitA->id);
});

it('allows a null day_number (unassigned)', function () {
    livewire(CreateSpeaker::class)
        ->fillForm([
            'summit_id' => $this->summitA->id,
            'slug' => 'no-day',
            'first_name' => 'Nada',
            'last_name' => 'Day',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Speaker::firstWhere('slug', 'no-day')->day_number)->toBeNull();
});

it('shows an All tab plus one tab per domain summit on the list page', function () {
    Speaker::factory()->create(['summit_id' => $this->summitA->id]);
    Speaker::factory()->create(['summit_id' => $this->summitB->id]);

    $tabs = livewire(ListSpeakers::class)->instance()->getTabs();

    expect(array_keys($tabs))->toContain('all');
    expect(array_keys($tabs))->toContain($this->summitA->id);
    expect(array_keys($tabs))->toContain($this->summitB->id);
});

it('summit tab filters speakers to only that summit', function () {
    Speaker::factory()->create([
        'summit_id' => $this->summitA->id,
        'first_name' => 'Alice',
        'last_name' => 'One',
    ]);
    Speaker::factory()->create([
        'summit_id' => $this->summitB->id,
        'first_name' => 'Bob',
        'last_name' => 'Two',
    ]);

    livewire(ListSpeakers::class, ['activeTab' => $this->summitA->id])
        ->assertCanSeeTableRecords(Speaker::where('summit_id', $this->summitA->id)->get())
        ->assertCanNotSeeTableRecords(Speaker::where('summit_id', $this->summitB->id)->get());
});
