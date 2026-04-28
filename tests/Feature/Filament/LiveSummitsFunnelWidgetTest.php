<?php

use App\Filament\Widgets\LiveSummitsFunnelWidget;
use App\Livewire\SummitAnalyticsBlock;
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

it('renders only summits that are currently live on the active domain', function () {
    $live = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    $past = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subMonth(),
        'ends_at' => now()->subWeek(),
    ]);
    $upcoming = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->addDay(),
        'ends_at' => now()->addMonth(),
    ]);

    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee($live->title)
        ->assertDontSee($past->title)
        ->assertDontSee($upcoming->title);
});

it('renders the analytics block once per live summit', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    PageView::factory()->count(5)->for($summit)->state(['page_type' => 'optin'])->create();

    // The header still belongs to the parent widget; the Overview/Performance
    // KPI grid lives inside a child Livewire component (SummitAnalyticsBlock).
    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee($summit->title)
        ->assertSeeLivewire(SummitAnalyticsBlock::class);
});

it('handles a summit with zero traffic without crashing', function () {
    Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);

    livewire(LiveSummitsFunnelWidget::class)
        ->assertOk();
});
