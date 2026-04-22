<?php

use App\Filament\Widgets\PastSummitsFunnelWidget;
use App\Models\Domain;
use App\Models\PageView;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Livewire\livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->admin()->create();
    $this->user->domains()->attach($this->domain);
    $this->actingAs($this->user);
    Filament::setTenant($this->domain);
});

it('only lists summits that have ended on this domain', function () {
    $past = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subMonth(),
        'ends_at' => now()->subWeek(),
    ]);
    $live = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);

    livewire(PastSummitsFunnelWidget::class)
        ->assertSee($past->title)
        ->assertDontSee($live->title);
});

it('is collapsed by default and loads the funnel lazily on expand', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subMonth(),
        'ends_at' => now()->subWeek(),
    ]);
    PageView::factory()->count(7)->for($summit)->state(['page_type' => 'optin'])->create();

    livewire(PastSummitsFunnelWidget::class)
        ->assertSee($summit->title)
        ->assertDontSee('Optin views')
        ->call('toggleExpanded', $summit->id)
        ->assertSee('Optin views')
        ->assertSee('7');
});
