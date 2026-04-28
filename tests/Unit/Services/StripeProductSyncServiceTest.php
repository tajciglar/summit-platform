<?php

use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Stripe\Service\PriceService;
use Stripe\Service\ProductService;
use Stripe\StripeClient;

uses(RefreshDatabase::class);

beforeEach(fn () => Queue::fake());

function fakeStripeClient(array &$calls = []): StripeClient
{
    $products = Mockery::mock(ProductService::class);
    $products->shouldReceive('create')
        ->andReturnUsing(function (array $params, array $opts) use (&$calls) {
            $calls[] = ['products.create', $params, $opts];

            return (object) ['id' => 'prod_fake_'.count($calls)];
        });

    $prices = Mockery::mock(PriceService::class);
    $prices->shouldReceive('create')
        ->andReturnUsing(function (array $params, array $opts) use (&$calls) {
            $calls[] = ['prices.create', $params, $opts];

            return (object) ['id' => 'price_fake_'.count($calls), 'unit_amount' => $params['unit_amount']];
        });
    $prices->shouldReceive('update')
        ->andReturnUsing(function (string $id, array $params) use (&$calls) {
            $calls[] = ['prices.update', $id, $params];

            return (object) ['id' => $id];
        });
    $prices->shouldReceive('retrieve')
        ->andReturnUsing(function (string $id) use (&$calls) {
            $calls[] = ['prices.retrieve', $id];

            return (object) ['id' => $id, 'unit_amount' => 9700];
        });

    $client = Mockery::mock(StripeClient::class);
    $client->shouldReceive('getService')->with('products')->andReturn($products);
    $client->shouldReceive('getService')->with('prices')->andReturn($prices);

    return $client;
}

it('creates a Stripe Product when missing and Prices for each priced phase', function () {
    $product = Product::factory()->create([
        'name' => 'Main Offer',
        'kind' => 'main',
        'is_active' => true,
        'stripe_product_id' => null,
        'price_pre_summit_cents' => 9700,
        'price_late_pre_cents' => 12700,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
        'billing_interval' => null,
    ]);

    $calls = [];
    $service = new StripeProductSyncService(fakeStripeClient($calls));

    $service->sync($product);
    $product->save();

    $product->refresh();
    expect($product->stripe_product_id)->toStartWith('prod_fake_');
    expect($product->stripe_price_pre_id)->toStartWith('price_fake_');
    expect($product->stripe_price_late_id)->toStartWith('price_fake_');
    expect($product->stripe_price_during_id)->toBeNull();
    expect($product->stripe_price_post_id)->toBeNull();

    $createPriceCalls = collect($calls)->where(0, 'prices.create')->values();
    expect($createPriceCalls)->toHaveCount(2);
});

it('uses deterministic idempotency keys', function () {
    $product = Product::factory()->create([
        'kind' => 'main',
        'is_active' => true,
        'stripe_product_id' => null,
        'price_pre_summit_cents' => 9700,
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
    ]);

    $calls = [];
    $service = new StripeProductSyncService(fakeStripeClient($calls));
    $service->sync($product);
    $product->save();

    $productCreate = collect($calls)->firstWhere(0, 'products.create');
    expect($productCreate[2]['idempotency_key'])->toBe("product-create-{$product->id}");

    $priceCreate = collect($calls)->firstWhere(0, 'prices.create');
    expect($priceCreate[2]['idempotency_key'])->toBe("price-create-{$product->id}-pre-9700");
});

it('creates recurring Prices when billing_interval is set', function () {
    $product = Product::factory()->create([
        'kind' => 'main',
        'is_active' => true,
        'stripe_product_id' => null,
        'price_pre_summit_cents' => 1900,
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
        'billing_interval' => 'month',
    ]);

    $calls = [];
    $service = new StripeProductSyncService(fakeStripeClient($calls));
    $service->sync($product);
    $product->save();

    $priceCreate = collect($calls)->firstWhere(0, 'prices.create');
    expect($priceCreate[1])->toHaveKey('recurring');
    expect($priceCreate[1]['recurring'])->toBe(['interval' => 'month']);
});

it('archives old Price and creates new when cents value changes', function () {
    $product = Product::factory()->create([
        'kind' => 'main',
        'is_active' => true,
        'stripe_product_id' => 'prod_existing',
        'stripe_price_pre_id' => 'price_old',
        'price_pre_summit_cents' => 12700, // raised from 9700
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
    ]);

    $calls = [];

    $products = Mockery::mock(ProductService::class);
    $prices = Mockery::mock(PriceService::class);

    $prices->shouldReceive('retrieve')
        ->with('price_old')
        ->andReturn((object) ['id' => 'price_old', 'unit_amount' => 9700])
        ->once();
    $prices->shouldReceive('update')
        ->with('price_old', ['active' => false])
        ->andReturn((object) ['id' => 'price_old'])
        ->once();
    $prices->shouldReceive('create')
        ->andReturnUsing(function (array $params, array $opts) use (&$calls) {
            $calls[] = $params;

            return (object) ['id' => 'price_new'];
        })
        ->once();

    $client = Mockery::mock(StripeClient::class);
    $client->shouldReceive('getService')->with('products')->andReturn($products);
    $client->shouldReceive('getService')->with('prices')->andReturn($prices);

    $service = new StripeProductSyncService($client);
    $service->sync($product);
    $product->save();

    $product->refresh();
    expect($product->stripe_price_pre_id)->toBe('price_new');
    expect($calls[0]['unit_amount'])->toBe(12700);
});

it('leaves existing Price alone when cents value matches', function () {
    $product = Product::factory()->create([
        'kind' => 'main',
        'is_active' => true,
        'stripe_product_id' => 'prod_existing',
        'stripe_price_pre_id' => 'price_ok',
        'price_pre_summit_cents' => 9700,
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
    ]);

    $products = Mockery::mock(ProductService::class);
    $prices = Mockery::mock(PriceService::class);

    $prices->shouldReceive('retrieve')
        ->with('price_ok')
        ->andReturn((object) ['id' => 'price_ok', 'unit_amount' => 9700])
        ->once();
    $prices->shouldNotReceive('create');
    $prices->shouldNotReceive('update');

    $client = Mockery::mock(StripeClient::class);
    $client->shouldReceive('getService')->with('products')->andReturn($products);
    $client->shouldReceive('getService')->with('prices')->andReturn($prices);

    $service = new StripeProductSyncService($client);
    $service->sync($product);
    $product->save();

    expect($product->fresh()->stripe_price_pre_id)->toBe('price_ok');
});
