<?php

use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marks product synced on success', function () {
    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'standalone',
        'stripe_sync_status' => 'pending',
    ]);

    $service = Mockery::mock(StripeProductSyncService::class);
    $service->shouldReceive('sync')->once()->with(Mockery::on(fn ($p) => $p->id === $product->id));
    $this->app->instance(StripeProductSyncService::class, $service);

    (new SyncProductToStripe($product->id))->handle(app(StripeProductSyncService::class));

    $product->refresh();
    expect($product->stripe_sync_status)->toBe('synced');
    expect($product->stripe_sync_error)->toBeNull();
    expect($product->stripe_synced_at)->not->toBeNull();
});

it('records failure and rethrows when service throws', function () {
    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'standalone',
        'stripe_sync_status' => 'pending',
    ]);

    $service = Mockery::mock(StripeProductSyncService::class);
    $service->shouldReceive('sync')->once()->andThrow(new RuntimeException('stripe boom'));
    $this->app->instance(StripeProductSyncService::class, $service);

    $job = new SyncProductToStripe($product->id);

    expect(fn () => $job->handle(app(StripeProductSyncService::class)))
        ->toThrow(RuntimeException::class, 'stripe boom');

    $product->refresh();
    expect($product->stripe_sync_status)->toBe('failed');
    expect($product->stripe_sync_error)->toBe('stripe boom');
});

it('no-ops when product is no longer syncable', function () {
    $product = Product::factory()->create([
        'is_active' => false,
        'kind' => 'standalone',
        'stripe_sync_status' => 'pending',
    ]);

    $service = Mockery::mock(StripeProductSyncService::class);
    $service->shouldNotReceive('sync');
    $this->app->instance(StripeProductSyncService::class, $service);

    (new SyncProductToStripe($product->id))->handle(app(StripeProductSyncService::class));

    expect($product->fresh()->stripe_sync_status)->toBe('pending');
});
