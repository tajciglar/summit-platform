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

it('persists day_number on the pivot when creating a speaker', function () {
    livewire(CreateSpeaker::class)
        ->fillForm([
            'speakerSummits' => [
                ['summit_id' => $this->summitA->id, 'day_number' => 2],
            ],
            'first_name' => 'Jane',
            'last_name' => 'Doe',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $speaker = Speaker::with('summits')
        ->where('first_name', 'Jane')
        ->where('last_name', 'Doe')
        ->first();
    expect($speaker)->not->toBeNull();
    expect($speaker->summits)->toHaveCount(1);
    expect($speaker->summits->first()->id)->toBe($this->summitA->id);
    expect($speaker->summits->first()->pivot->day_number)->toBe(2);
});

it('allows a null day_number (unassigned)', function () {
    livewire(CreateSpeaker::class)
        ->fillForm([
            'speakerSummits' => [
                ['summit_id' => $this->summitA->id, 'day_number' => null],
            ],
            'first_name' => 'Nada',
            'last_name' => 'Day',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $speaker = Speaker::with('summits')
        ->where('first_name', 'Nada')
        ->where('last_name', 'Day')
        ->first();
    expect($speaker->summits->first()->pivot->day_number)->toBeNull();
});

it('attaches a speaker to multiple summits at create time', function () {
    livewire(CreateSpeaker::class)
        ->fillForm([
            'speakerSummits' => [
                ['summit_id' => $this->summitA->id, 'day_number' => 2],
                ['summit_id' => $this->summitB->id, 'day_number' => 5],
            ],
            'first_name' => 'Multi',
            'last_name' => 'Attach',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $speaker = Speaker::with('summits')
        ->where('first_name', 'Multi')
        ->where('last_name', 'Attach')
        ->first();
    expect($speaker->summits)->toHaveCount(2);
    $byId = $speaker->summits->keyBy('id');
    expect($byId[$this->summitA->id]->pivot->day_number)->toBe(2);
    expect($byId[$this->summitB->id]->pivot->day_number)->toBe(5);
});

it('auto-generates a slug when creating a speaker', function () {
    livewire(CreateSpeaker::class)
        ->fillForm([
            'speakerSummits' => [
                ['summit_id' => $this->summitA->id, 'day_number' => 1],
            ],
            'first_name' => 'Taylor',
            'last_name' => 'Jones',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $speaker = Speaker::query()->firstWhere('first_name', 'Taylor');

    expect($speaker)->not->toBeNull();
    expect($speaker?->slug)->toBe('taylor-jones');
});

it('renders no tab strip on the speakers list page (Area 4.1)', function () {
    Speaker::factory()->forSummit($this->summitA->id)->create();
    Speaker::factory()->forSummit($this->summitB->id)->create();

    $tabs = livewire(ListSpeakers::class)->instance()->getTabs();

    expect($tabs)->toBe([]);
});

it('summit SelectFilter narrows the table to a single summit', function () {
    Speaker::factory()->forSummit($this->summitA)->create([
        'first_name' => 'Alice',
        'last_name' => 'One',
    ]);
    Speaker::factory()->forSummit($this->summitB)->create([
        'first_name' => 'Bob',
        'last_name' => 'Two',
    ]);

    livewire(ListSpeakers::class)
        ->filterTable('summits', [$this->summitA->id])
        ->assertCanSeeTableRecords($this->summitA->speakers)
        ->assertCanNotSeeTableRecords($this->summitB->speakers);
});
