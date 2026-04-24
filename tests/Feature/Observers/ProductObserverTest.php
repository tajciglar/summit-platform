<?php

use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;

uses(RefreshDatabase::class);

it('dispatches sync job when product is saved active and non-combo', function () {
    Bus::fake();

    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'standalone',
    ]);

    Bus::assertDispatched(SyncProductToStripe::class, fn ($job) => $job->productId === $product->id);
});

it('does not dispatch when product is inactive', function () {
    Bus::fake();

    Product::factory()->create(['is_active' => false, 'kind' => 'standalone']);

    Bus::assertNotDispatched(SyncProductToStripe::class);
});

it('does not dispatch when product is a combo', function () {
    Bus::fake();

    Product::factory()->create(['is_active' => true, 'kind' => 'combo']);

    Bus::assertNotDispatched(SyncProductToStripe::class);
});

it('dispatches again when a price cents column changes', function () {
    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'standalone',
        'price_pre_summit_cents' => 9700,
    ]);

    Bus::fake();
    $product->update(['price_pre_summit_cents' => 12700]);

    Bus::assertDispatched(SyncProductToStripe::class, fn ($job) => $job->productId === $product->id);
});

it('does not dispatch on irrelevant updates', function () {
    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'standalone',
        'description' => 'Before',
    ]);

    Bus::fake();
    $product->update(['description' => 'some new description']);

    Bus::assertNotDispatched(SyncProductToStripe::class);
});
