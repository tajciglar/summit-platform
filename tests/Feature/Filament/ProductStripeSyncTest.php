<?php

use App\Filament\Resources\Products\Pages\EditProduct;
use App\Jobs\SyncProductToStripe;
use App\Models\Domain;
use App\Models\Product;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Gate;

use function Pest\Livewire\livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->domain = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'stripe-sync-test.localhost',
        'slug' => 'stripe-sync-test',
        'is_active' => true,
    ]);
    Filament::setTenant($this->domain);
});

it('shows retry sync action when status is failed', function () {
    Bus::fake();

    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'main',
        'stripe_sync_status' => 'failed',
        'stripe_sync_error' => 'boom',
    ]);

    livewire(EditProduct::class, ['record' => $product->getKey()])
        ->assertActionVisible('retryStripeSync')
        ->callAction('retryStripeSync');

    Bus::assertDispatched(SyncProductToStripe::class);
});

it('hides retry action when status is synced', function () {
    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'main',
        'stripe_sync_status' => 'synced',
    ]);

    livewire(EditProduct::class, ['record' => $product->getKey()])
        ->assertActionHidden('retryStripeSync');
});
