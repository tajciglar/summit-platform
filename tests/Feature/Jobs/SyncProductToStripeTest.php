<?php

use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

it('marks product synced on success', function () {
    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'main',
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
        'kind' => 'main',
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
        'kind' => 'main',
        'stripe_sync_status' => 'pending',
    ]);

    $service = Mockery::mock(StripeProductSyncService::class);
    $service->shouldNotReceive('sync');
    $this->app->instance(StripeProductSyncService::class, $service);

    (new SyncProductToStripe($product->id))->handle(app(StripeProductSyncService::class));

    expect($product->fresh()->stripe_sync_status)->toBe('pending');
});

it('persists Stripe IDs written by the service alongside sync status', function () {
    // Fake the queue so that the observer's re-dispatch (triggered when
    // stripe_product_id changes from null → a real ID) does not execute
    // a second job during this test.
    Queue::fake();

    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'main',
        'stripe_sync_status' => 'pending',
        'stripe_product_id' => null,
        'stripe_price_pre_id' => null,
        'price_pre_summit_cents' => 9700,
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
    ]);

    // Service mock that mutates the product the way the real service does,
    // ensuring forceFill([...sync cols])->save() persists both the service-written
    // IDs and the sync-status together in a single save() call.
    $service = Mockery::mock(StripeProductSyncService::class);
    $service->shouldReceive('sync')->once()->andReturnUsing(function (Product $p): void {
        $p->stripe_product_id = 'prod_persisted';
        $p->stripe_price_pre_id = 'price_persisted';
    });
    $this->app->instance(StripeProductSyncService::class, $service);

    (new SyncProductToStripe($product->id))->handle(
        app(StripeProductSyncService::class)
    );

    $fresh = $product->fresh();
    expect($fresh->stripe_product_id)->toBe('prod_persisted');
    expect($fresh->stripe_price_pre_id)->toBe('price_persisted');
    expect($fresh->stripe_sync_status)->toBe('synced');
});
