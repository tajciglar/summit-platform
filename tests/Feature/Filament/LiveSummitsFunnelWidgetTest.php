<?php

use App\Filament\Widgets\LiveSummitsFunnelWidget;
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

it('renders the four funnel counts and conversion rates', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    PageView::factory()->count(100)->for($summit)->state(['page_type' => 'optin'])->create();
    PageView::factory()->count(30)->for($summit)->state(['page_type' => 'optin_submit'])->create();
    PageView::factory()->count(20)->for($summit)->state(['page_type' => 'sales'])->create();
    PageView::factory()->count(5)->for($summit)->state(['page_type' => 'checkout_click'])->create();

    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee('100')
        ->assertSee('30')
        ->assertSee('20')
        ->assertSee('5')
        ->assertSee('30.0%')
        ->assertSee('66.7%')
        ->assertSee('25.0%');
});

it('shows a leak alert when a step conversion is below the threshold', function () {
    $summit = Summit::factory()->create([
        'domain_id' => $this->domain->id,
        'pre_summit_starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    PageView::factory()->count(100)->for($summit)->state(['page_type' => 'optin'])->create();
    PageView::factory()->count(10)->for($summit)->state(['page_type' => 'optin_submit'])->create();
    PageView::factory()->count(9)->for($summit)->state(['page_type' => 'sales'])->create();
    PageView::factory()->count(1)->for($summit)->state(['page_type' => 'checkout_click'])->create();

    livewire(LiveSummitsFunnelWidget::class)
        ->assertSee('Leak alert');
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
