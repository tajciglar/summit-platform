# Stripe Product/Price Auto-Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate Stripe Product + Price creation/reconciliation from Filament `ProductResource` saves, eliminating manual Stripe ID entry and laying the foundation for a future checkout flow.

**Architecture:** Product save → Observer dispatches `SyncProductToStripe` job → job delegates to `StripeProductSyncService` which creates/archives Stripe objects via `StripeClient`. New `stripe_sync_status`/`stripe_sync_error`/`stripe_synced_at` columns surface state in Filament. Forward-only price changes (archive old Price, create new).

**Tech Stack:** Laravel 13, PHP 8.4, Filament v4, `stripe/stripe-php` (already installed via Cashier), Pest v4 for tests.

**Spec:** `docs/superpowers/specs/2026-04-24-stripe-auto-provisioning-design.md`

---

## File Structure

**Create:**
- `database/migrations/2026_04_24_XXXXXX_add_stripe_sync_columns_to_products_table.php` — adds `stripe_sync_status`, `stripe_sync_error`, `stripe_synced_at`.
- `app/Services/Stripe/StripeProductSyncService.php` — pure service that takes a `Product` and a `StripeClient` and reconciles Stripe state. Unit-testable.
- `app/Jobs/SyncProductToStripe.php` — queued job that resolves the service, calls it, writes status back to the Product.
- `app/Observers/ProductObserver.php` — dispatches the job after save when `is_active = true` and `kind != 'combo'`.
- `app/Filament/Resources/Products/Actions/RetryStripeSyncAction.php` — Filament header action for failed syncs.
- `tests/Unit/Services/StripeProductSyncServiceTest.php`
- `tests/Feature/Jobs/SyncProductToStripeTest.php`
- `tests/Feature/Filament/ProductStripeSyncTest.php`

**Modify:**
- `app/Models/Product.php` — add new columns to `$fillable` and `$casts`; add `isSyncableToStripe()` helper.
- `app/Providers/AppServiceProvider.php` — register `ProductObserver`.
- `app/Filament/Resources/Products/ProductResource.php:280-300` — replace manual Stripe ID TextInputs with read-only section + sync badge.
- `app/Filament/Resources/Products/Pages/EditProduct.php` — add `RetryStripeSyncAction` to header.

---

## Task 1: Migration for sync status columns

**Files:**
- Create: `database/migrations/2026_04_24_100000_add_stripe_sync_columns_to_products_table.php`

- [ ] **Step 1: Generate migration file**

Run:
```bash
php artisan make:migration add_stripe_sync_columns_to_products_table --table=products
```

- [ ] **Step 2: Replace migration contents**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('stripe_sync_status', 16)->default('pending')->after('stripe_product_id');
            $table->text('stripe_sync_error')->nullable()->after('stripe_sync_status');
            $table->timestampTz('stripe_synced_at')->nullable()->after('stripe_sync_error');

            $table->index('stripe_sync_status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['stripe_sync_status']);
            $table->dropColumn(['stripe_sync_status', 'stripe_sync_error', 'stripe_synced_at']);
        });
    }
};
```

- [ ] **Step 3: Run migration**

```bash
php artisan migrate
```

Expected: `Migrating: 2026_04_24_100000_add_stripe_sync_columns_to_products_table` then `Migrated`.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_24_100000_add_stripe_sync_columns_to_products_table.php
git commit -m "feat(db): add stripe sync status columns to products"
```

---

## Task 2: Update Product model

**Files:**
- Modify: `app/Models/Product.php`

- [ ] **Step 1: Add new fields to `$fillable`**

In `app/Models/Product.php`, add these entries to the `$fillable` array immediately after `'stripe_product_id'`:

```php
'stripe_sync_status',
'stripe_sync_error',
'stripe_synced_at',
```

- [ ] **Step 2: Add cast for `stripe_synced_at`**

In `casts()`, add:

```php
'stripe_synced_at' => 'datetime',
```

- [ ] **Step 3: Add sync eligibility helper**

Add this method to the Product class:

```php
/**
 * Whether this product should auto-provision to Stripe.
 * Combo products render as child line items at checkout; they have no
 * Stripe Price of their own.
 */
public function isSyncableToStripe(): bool
{
    return $this->is_active && $this->kind !== 'combo';
}
```

- [ ] **Step 4: Run formatter**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 5: Commit**

```bash
git add app/Models/Product.php
git commit -m "feat(model): expose stripe sync status fields on Product"
```

---

## Task 3: StripeProductSyncService — happy path (create-only)

We build this in two passes. First pass: create new Stripe Product + Prices when missing. Second pass (Task 4): handle price *changes* via archive + recreate.

**Files:**
- Create: `app/Services/Stripe/StripeProductSyncService.php`
- Create: `tests/Unit/Services/StripeProductSyncServiceTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Unit/Services/StripeProductSyncServiceTest.php`:

```php
<?php

use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;
use Stripe\StripeClient;

uses(\Tests\TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

function fakeStripeClient(array &$calls = []): StripeClient
{
    $client = Mockery::mock(StripeClient::class);

    $products = Mockery::mock();
    $products->shouldReceive('create')
        ->andReturnUsing(function (array $params, array $opts) use (&$calls) {
            $calls[] = ['products.create', $params, $opts];

            return (object) ['id' => 'prod_fake_'.count($calls)];
        });

    $prices = Mockery::mock();
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

    $client->products = $products;
    $client->prices = $prices;

    return $client;
}

it('creates a Stripe Product when missing and Prices for each priced phase', function () {
    $product = Product::factory()->create([
        'name' => 'Main Offer',
        'kind' => 'standalone',
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
        'kind' => 'standalone',
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

    $productCreate = collect($calls)->firstWhere(0, 'products.create');
    expect($productCreate[2]['idempotency_key'])->toBe("product-create-{$product->id}");

    $priceCreate = collect($calls)->firstWhere(0, 'prices.create');
    expect($priceCreate[2]['idempotency_key'])->toBe("price-create-{$product->id}-pre-9700");
});

it('creates recurring Prices when billing_interval is set', function () {
    $product = Product::factory()->create([
        'kind' => 'standalone',
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

    $priceCreate = collect($calls)->firstWhere(0, 'prices.create');
    expect($priceCreate[1])->toHaveKey('recurring');
    expect($priceCreate[1]['recurring'])->toBe(['interval' => 'month']);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --compact --filter=StripeProductSyncServiceTest`
Expected: 3 FAILs with "Class App\Services\Stripe\StripeProductSyncService not found".

- [ ] **Step 3: Create the service (create-only implementation)**

Create `app/Services/Stripe/StripeProductSyncService.php`:

```php
<?php

namespace App\Services\Stripe;

use App\Models\Product;
use Stripe\StripeClient;

class StripeProductSyncService
{
    public const PHASES = ['pre', 'late_pre', 'during', 'post'];

    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * Reconcile this Product's Stripe objects. Creates missing Product/Prices;
     * archives and recreates Prices whose cents value changed since last sync.
     */
    public function sync(Product $product): void
    {
        $this->ensureStripeProduct($product);

        foreach (self::PHASES as $phase) {
            $this->ensureStripePrice($product, $phase);
        }

        $product->save();
    }

    private function ensureStripeProduct(Product $product): void
    {
        if ($product->stripe_product_id) {
            return;
        }

        $created = $this->stripe->products->create(
            [
                'name' => $product->name,
                'metadata' => ['internal_id' => (string) $product->id],
            ],
            ['idempotency_key' => "product-create-{$product->id}"],
        );

        $product->stripe_product_id = $created->id;
    }

    private function ensureStripePrice(Product $product, string $phase): void
    {
        $cents = $product->priceCentsForPhase($phase);
        $existingId = $product->stripePriceIdForPhase($phase);

        if ($cents === null) {
            return;
        }

        if ($existingId !== null) {
            return; // price-change reconciliation lands in Task 4
        }

        $params = [
            'product' => $product->stripe_product_id,
            'unit_amount' => $cents,
            'currency' => 'usd',
            'metadata' => [
                'internal_product_id' => (string) $product->id,
                'phase' => $phase,
            ],
        ];

        if ($product->billing_interval) {
            $params['recurring'] = ['interval' => $product->billing_interval];
        }

        $created = $this->stripe->prices->create(
            $params,
            ['idempotency_key' => "price-create-{$product->id}-{$phase}-{$cents}"],
        );

        $column = self::stripePriceColumn($phase);
        $product->{$column} = $created->id;
    }

    public static function stripePriceColumn(string $phase): string
    {
        return match ($phase) {
            'pre' => 'stripe_price_pre_id',
            'late_pre' => 'stripe_price_late_id',
            'during' => 'stripe_price_during_id',
            'post' => 'stripe_price_post_id',
        };
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --compact --filter=StripeProductSyncServiceTest`
Expected: 3 PASS.

- [ ] **Step 5: Format & commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Services/Stripe/StripeProductSyncService.php tests/Unit/Services/StripeProductSyncServiceTest.php
git commit -m "feat(stripe): add StripeProductSyncService for create path"
```

---

## Task 4: StripeProductSyncService — price change reconciliation

**Files:**
- Modify: `app/Services/Stripe/StripeProductSyncService.php`
- Modify: `tests/Unit/Services/StripeProductSyncServiceTest.php`

- [ ] **Step 1: Write the failing test**

Add this test to `tests/Unit/Services/StripeProductSyncServiceTest.php`:

```php
it('archives old Price and creates new when cents value changes', function () {
    $product = Product::factory()->create([
        'kind' => 'standalone',
        'is_active' => true,
        'stripe_product_id' => 'prod_existing',
        'stripe_price_pre_id' => 'price_old',
        'price_pre_summit_cents' => 12700, // raised from 9700
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
    ]);

    $calls = [];
    $client = Mockery::mock(StripeClient::class);

    $prices = Mockery::mock();
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

    $client->products = Mockery::mock();
    $client->prices = $prices;

    $service = new StripeProductSyncService($client);
    $service->sync($product);

    $product->refresh();
    expect($product->stripe_price_pre_id)->toBe('price_new');
    expect($calls[0]['unit_amount'])->toBe(12700);
});

it('leaves existing Price alone when cents value matches', function () {
    $product = Product::factory()->create([
        'kind' => 'standalone',
        'is_active' => true,
        'stripe_product_id' => 'prod_existing',
        'stripe_price_pre_id' => 'price_ok',
        'price_pre_summit_cents' => 9700,
        'price_late_pre_cents' => null,
        'price_during_cents' => null,
        'price_post_summit_cents' => null,
    ]);

    $client = Mockery::mock(StripeClient::class);
    $prices = Mockery::mock();
    $prices->shouldReceive('retrieve')
        ->with('price_ok')
        ->andReturn((object) ['id' => 'price_ok', 'unit_amount' => 9700])
        ->once();
    $prices->shouldNotReceive('create');
    $prices->shouldNotReceive('update');

    $client->products = Mockery::mock();
    $client->prices = $prices;

    $service = new StripeProductSyncService($client);
    $service->sync($product);

    expect($product->fresh()->stripe_price_pre_id)->toBe('price_ok');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --compact --filter=StripeProductSyncServiceTest`
Expected: 2 new FAILs (existing 3 still pass).

- [ ] **Step 3: Implement reconciliation**

Replace `ensureStripePrice()` in `app/Services/Stripe/StripeProductSyncService.php` with:

```php
private function ensureStripePrice(Product $product, string $phase): void
{
    $cents = $product->priceCentsForPhase($phase);
    $existingId = $product->stripePriceIdForPhase($phase);

    if ($cents === null) {
        return;
    }

    if ($existingId !== null) {
        $existing = $this->stripe->prices->retrieve($existingId);

        if ((int) $existing->unit_amount === $cents) {
            return;
        }

        $this->stripe->prices->update($existingId, ['active' => false]);
    }

    $params = [
        'product' => $product->stripe_product_id,
        'unit_amount' => $cents,
        'currency' => 'usd',
        'metadata' => [
            'internal_product_id' => (string) $product->id,
            'phase' => $phase,
        ],
    ];

    if ($product->billing_interval) {
        $params['recurring'] = ['interval' => $product->billing_interval];
    }

    $created = $this->stripe->prices->create(
        $params,
        ['idempotency_key' => "price-create-{$product->id}-{$phase}-{$cents}"],
    );

    $column = self::stripePriceColumn($phase);
    $product->{$column} = $created->id;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --compact --filter=StripeProductSyncServiceTest`
Expected: 5 PASS.

- [ ] **Step 5: Format & commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Services/Stripe/StripeProductSyncService.php tests/Unit/Services/StripeProductSyncServiceTest.php
git commit -m "feat(stripe): reconcile price changes via archive + recreate"
```

---

## Task 5: SyncProductToStripe job

**Files:**
- Create: `app/Jobs/SyncProductToStripe.php`
- Create: `tests/Feature/Jobs/SyncProductToStripeTest.php`

- [ ] **Step 1: Write the failing tests**

Create `tests/Feature/Jobs/SyncProductToStripeTest.php`:

```php
<?php

use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;

uses(\Tests\TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --compact --filter=SyncProductToStripeTest`
Expected: 3 FAILs with "Class App\Jobs\SyncProductToStripe not found".

- [ ] **Step 3: Create the job**

Create `app/Jobs/SyncProductToStripe.php`:

```php
<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class SyncProductToStripe implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public readonly string $productId) {}

    public function handle(StripeProductSyncService $service): void
    {
        $product = Product::query()->find($this->productId);

        if (! $product || ! $product->isSyncableToStripe()) {
            return;
        }

        try {
            $service->sync($product);

            $product->forceFill([
                'stripe_sync_status' => 'synced',
                'stripe_sync_error' => null,
                'stripe_synced_at' => now(),
            ])->save();
        } catch (Throwable $e) {
            $product->forceFill([
                'stripe_sync_status' => 'failed',
                'stripe_sync_error' => $e->getMessage(),
            ])->save();

            throw $e;
        }
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --compact --filter=SyncProductToStripeTest`
Expected: 3 PASS.

- [ ] **Step 5: Format & commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Jobs/SyncProductToStripe.php tests/Feature/Jobs/SyncProductToStripeTest.php
git commit -m "feat(stripe): add SyncProductToStripe queued job"
```

---

## Task 6: ProductObserver — dispatch on save

**Files:**
- Create: `app/Observers/ProductObserver.php`
- Modify: `app/Providers/AppServiceProvider.php`
- Create: `tests/Feature/Observers/ProductObserverTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/Observers/ProductObserverTest.php`:

```php
<?php

use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use Illuminate\Support\Facades\Bus;

uses(\Tests\TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

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
        'name' => 'Before',
    ]);

    Bus::fake();
    $product->update(['name' => 'After']);

    Bus::assertNotDispatched(SyncProductToStripe::class);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --compact --filter=ProductObserverTest`
Expected: 5 FAILs.

- [ ] **Step 3: Create the observer**

Create `app/Observers/ProductObserver.php`:

```php
<?php

namespace App\Observers;

use App\Jobs\SyncProductToStripe;
use App\Models\Product;

class ProductObserver
{
    private const TRIGGER_COLUMNS = [
        'is_active',
        'name',
        'billing_interval',
        'stripe_product_id',
        'price_pre_summit_cents',
        'price_late_pre_cents',
        'price_during_cents',
        'price_post_summit_cents',
    ];

    public function created(Product $product): void
    {
        $this->dispatchIfSyncable($product);
    }

    public function updated(Product $product): void
    {
        $dirty = array_keys($product->getChanges());

        if (array_intersect($dirty, self::TRIGGER_COLUMNS) === []) {
            return;
        }

        $this->dispatchIfSyncable($product);
    }

    private function dispatchIfSyncable(Product $product): void
    {
        if (! $product->isSyncableToStripe()) {
            return;
        }

        SyncProductToStripe::dispatch($product->id);
    }
}
```

- [ ] **Step 4: Register the observer**

In `app/Providers/AppServiceProvider.php`, add to the top:

```php
use App\Models\Product;
use App\Observers\ProductObserver;
```

And in the `boot()` method add:

```php
Product::observe(ProductObserver::class);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `php artisan test --compact --filter=ProductObserverTest`
Expected: 5 PASS.

- [ ] **Step 6: Format & commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Observers/ProductObserver.php app/Providers/AppServiceProvider.php tests/Feature/Observers/ProductObserverTest.php
git commit -m "feat(stripe): dispatch sync job from Product observer"
```

---

## Task 7: ProductResource — replace manual inputs with read-only sync panel

**Files:**
- Modify: `app/Filament/Resources/Products/ProductResource.php:280-300`

- [ ] **Step 1: Replace the Stripe tab contents**

In `app/Filament/Resources/Products/ProductResource.php`, find the `Tab::make('Stripe')` block (around lines 280-300) and replace it with:

```php
Tab::make('Stripe')
    ->icon(Heroicon::OutlinedCreditCard)
    ->visible(fn (callable $get): bool => $get('kind') !== 'combo')
    ->schema([
        Section::make()
            ->description('Stripe Product and Price IDs are managed automatically when the product is active. Edit prices on the Pricing tab; this panel shows the current Stripe state.')
            ->components([
                Placeholder::make('stripe_sync_status_display')
                    ->label('Sync status')
                    ->content(function (?Product $record): HtmlString {
                        if (! $record) {
                            return new HtmlString('<span class="text-gray-500">Save the product to trigger the first sync.</span>');
                        }
                        $status = $record->stripe_sync_status ?? 'pending';
                        $color = match ($status) {
                            'synced' => 'text-green-600',
                            'failed' => 'text-red-600',
                            default => 'text-gray-500',
                        };
                        $when = $record->stripe_synced_at?->diffForHumans() ?? 'never';
                        $err = $record->stripe_sync_error ? "<div class=\"mt-1 text-xs text-red-600\">{$record->stripe_sync_error}</div>" : '';

                        return new HtmlString("<div class=\"{$color} font-medium\">".ucfirst($status)."</div><div class=\"text-xs text-gray-500\">Last synced: {$when}</div>{$err}");
                    }),
                Placeholder::make('stripe_product_id_display')
                    ->label('Stripe product ID')
                    ->content(fn (?Product $record) => $record?->stripe_product_id ?? '—'),
                Fieldset::make('Stripe price IDs')
                    ->columns(4)
                    ->schema([
                        Placeholder::make('stripe_price_pre_id_display')->label('Pre')
                            ->content(fn (?Product $r) => $r?->stripe_price_pre_id ?? '—'),
                        Placeholder::make('stripe_price_late_id_display')->label('Late pre')
                            ->content(fn (?Product $r) => $r?->stripe_price_late_id ?? '—'),
                        Placeholder::make('stripe_price_during_id_display')->label('During')
                            ->content(fn (?Product $r) => $r?->stripe_price_during_id ?? '—'),
                        Placeholder::make('stripe_price_post_id_display')->label('Post')
                            ->content(fn (?Product $r) => $r?->stripe_price_post_id ?? '—'),
                    ]),
            ]),
    ]),
```

- [ ] **Step 2: Smoke-test the form**

Run:
```bash
php artisan test --compact --filter=ProductResource
```

Expected: existing ProductResource tests still pass. If no such tests exist, skip this step and rely on Task 8's Filament test.

- [ ] **Step 3: Format & commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Filament/Resources/Products/ProductResource.php
git commit -m "feat(filament): replace manual Stripe ID inputs with read-only sync panel"
```

---

## Task 8: Retry action on EditProduct page

**Files:**
- Modify: `app/Filament/Resources/Products/Pages/EditProduct.php`
- Create: `tests/Feature/Filament/ProductStripeSyncTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/Filament/ProductStripeSyncTest.php`:

```php
<?php

use App\Filament\Resources\Products\Pages\EditProduct;
use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Bus;

use function Pest\Livewire\livewire;

uses(\Tests\TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('shows retry sync action when status is failed', function () {
    Bus::fake();

    $product = Product::factory()->create([
        'is_active' => true,
        'kind' => 'standalone',
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
        'kind' => 'standalone',
        'stripe_sync_status' => 'synced',
    ]);

    livewire(EditProduct::class, ['record' => $product->getKey()])
        ->assertActionHidden('retryStripeSync');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --compact --filter=ProductStripeSyncTest`
Expected: 2 FAILs.

- [ ] **Step 3: Add the action**

Replace `app/Filament/Resources/Products/Pages/EditProduct.php` with:

```php
<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('retryStripeSync')
                ->label('Retry Stripe sync')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->visible(fn (Product $record): bool => $record->stripe_sync_status === 'failed')
                ->action(function (Product $record): void {
                    SyncProductToStripe::dispatch($record->id);
                    Notification::make()
                        ->title('Stripe sync queued')
                        ->success()
                        ->send();
                }),
            DeleteAction::make(),
        ];
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --compact --filter=ProductStripeSyncTest`
Expected: 2 PASS.

- [ ] **Step 5: Format & commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Filament/Resources/Products/Pages/EditProduct.php tests/Feature/Filament/ProductStripeSyncTest.php
git commit -m "feat(filament): add retry Stripe sync action to EditProduct"
```

---

## Task 9: Full-suite verification

- [ ] **Step 1: Run the full test suite**

Run: `php artisan test --compact`
Expected: all tests pass, including the new ones from Tasks 3-8.

- [ ] **Step 2: Run Pint on the whole patch**

```bash
vendor/bin/pint --dirty --format agent
```

Expected: clean, nothing to fix.

- [ ] **Step 3: Manual sanity check (optional)**

With `composer dev` running and Stripe test keys in `.env`:
1. Visit `/admin/products/create`.
2. Create a standalone product with prices set and `is_active = true`.
3. Watch the queue worker output — should see `SyncProductToStripe` run.
4. Refresh the edit page — Stripe tab should show `Synced`, a `prod_...` ID, and phase price IDs.
5. Edit `price_pre_summit_cents`, save, refresh — Pre price ID changes, old one archived in Stripe dashboard.

- [ ] **Step 4: Final commit if anything lingering**

```bash
git status
# if anything uncommitted from formatting:
git add -A && git commit -m "chore: pint formatting pass"
```

---

## Self-review notes

- Spec coverage: trigger (Task 6) ✓, async execution (Task 5) ✓, service responsibilities incl. create + archive-recreate (Tasks 3-4) ✓, schema (Task 1) ✓, Filament integration (Tasks 7-8) ✓, non-goals respected (no checkout, no combos, no `compare_*` sync) ✓.
- `intro_price_cents` / `intro_period_months` handling deferred as the spec flagged — plan intentionally does not wire it; add to a follow-up when subscription products are actually sold.
- No live Stripe calls in any test — `StripeClient` is always mocked or the service is mocked at the job layer.
- All method signatures are consistent across tasks (`sync()`, `isSyncableToStripe()`, `stripePriceColumn()`, job constructor takes `string $productId`).
