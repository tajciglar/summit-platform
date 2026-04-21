# Media Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a per-domain media library backed by Bunny Storage that becomes the single source of truth for every image (and scaffolds PDF uploads) across the admin panel.

**Architecture:** A `MediaItem` model wraps one Spatie media row (stored on a new `bunny` filesystem disk) and carries domain/category metadata. All owning models (Summit, Product, Speaker, FunnelStepBump, Domain, AppSettings) drop their per-model `HasMedia` and instead use a polymorphic pivot `media_item_attachments` to reference library items. A Filament resource provides the library UI; a reusable `MediaPickerInput` field provides the picker modal embedded in other resource forms. A one-shot command migrates the existing local-disk media into the library.

**Tech Stack:** Laravel 13, PHP 8.4, Filament v4, Spatie MediaLibrary, Bunny Flysystem adapter (`platformcommunity/flysystem-bunny-cdn`), Spatie Permissions, Pest 4, PostgreSQL. All tables use UUID PKs via `App\Models\Concerns\HasUuid`. Migrations follow the project's existing convention: raw `DB::statement` SQL for `CREATE TABLE`, `Schema::table` for alters.

**Spec:** `docs/superpowers/specs/2026-04-21-media-library-design.md`

---

## File structure

**New files:**
- `app/Enums/MediaCategory.php`
- `app/Models/MediaItem.php`
- `app/Models/Concerns/HasMediaAttachments.php`
- `app/Support/Media/MediaItemPathGenerator.php`
- `app/Filament/Resources/MediaItems/MediaItemResource.php`
- `app/Filament/Resources/MediaItems/Pages/ListMediaItems.php`
- `app/Filament/Resources/MediaItems/Pages/CreateMediaItem.php` (only if needed — most uploads happen inline)
- `app/Filament/Forms/Components/MediaPickerInput.php`
- `app/Filament/Forms/Components/MediaPickerModal.php` (Livewire component for the modal)
- `resources/views/filament/forms/components/media-picker-input.blade.php`
- `resources/views/filament/forms/components/media-picker-modal.blade.php`
- `app/Console/Commands/MediaLibraryMigrateCommand.php`
- `app/Console/Commands/MediaLibraryDropLegacyCommand.php`
- `database/migrations/2026_04_21_120000_create_media_items_table.php`
- `database/migrations/2026_04_21_120100_create_media_item_attachments_table.php`
- `database/migrations/2026_04_21_120200_seed_media_library_permissions.php`
- `config/media-library.php` (published from Spatie)
- `tests/Feature/MediaLibrary/MediaItemResourceTest.php`
- `tests/Feature/MediaLibrary/MediaPickerInputTest.php`
- `tests/Feature/MediaLibrary/MediaLibraryMigrateCommandTest.php`
- `tests/Unit/Models/MediaItemTest.php`
- `tests/Unit/Concerns/HasMediaAttachmentsTest.php`

**Modified files:**
- `config/filesystems.php` — add `bunny` disk
- `app/Models/Summit.php` — drop HasMedia, adopt HasMediaAttachments
- `app/Models/Product.php` — same
- `app/Models/Speaker.php` — same
- `app/Models/FunnelStepBump.php` — same
- `app/Models/Domain.php` — same
- `app/Models/AppSettings.php` — same
- `app/Filament/Resources/Summits/SummitResource.php` — swap SpatieMediaLibraryFileUpload → MediaPickerInput
- `app/Filament/Resources/Products/ProductResource.php` — same
- `app/Filament/Resources/Speakers/SpeakerResource.php` — same
- `app/Filament/Resources/FunnelStepBumps/FunnelStepBumpResource.php` — same
- `app/Filament/Resources/Domains/DomainResource.php` — same
- `app/Filament/Pages/Settings.php` — same (AppSettings logo)
- `composer.json` — add `platformcommunity/flysystem-bunny-cdn`

---

## Task 1: Bunny filesystem disk

**Files:**
- Modify: `composer.json` (add dependency)
- Modify: `config/filesystems.php` (new disk)
- Modify: `.env.example` (already has stubs; verify)

- [ ] **Step 1: Install the Bunny Flysystem adapter**

Run:
```bash
composer require platformcommunity/flysystem-bunny-cdn
```

Expected: composer installs the package and updates `composer.lock`. If this package is unmaintained at the time of implementation, swap for the current community-recommended Bunny Flysystem adapter and update the driver name used in step 2 accordingly.

- [ ] **Step 2: Register the `bunny` disk**

Append to `config/filesystems.php` inside the `disks` array (before the closing `]`):

```php
'bunny' => [
    'driver' => 'bunnycdn',
    'storage_zone' => env('BUNNY_CDN_STORAGE_ZONE'),
    'api_key' => env('BUNNY_CDN_API_KEY'),
    'region' => env('BUNNY_CDN_REGION', ''),
    'pull_zone_url' => env('BUNNY_CDN_HOSTNAME'),
    'throw' => true,
],
```

- [ ] **Step 3: Verify env stubs exist**

Check `.env.example` already contains:
```
BUNNY_CDN_HOSTNAME=
BUNNY_CDN_STORAGE_ZONE=
BUNNY_CDN_API_KEY=
```

If missing, add them.

- [ ] **Step 4: Commit**

```bash
git add composer.json composer.lock config/filesystems.php .env.example
git commit -m "feat(media-library): register bunny filesystem disk"
```

---

## Task 2: MediaCategory enum

**Files:**
- Create: `app/Enums/MediaCategory.php`
- Create: `tests/Unit/Enums/MediaCategoryTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Unit/Enums/MediaCategoryTest.php`:

```php
<?php

use App\Enums\MediaCategory;

it('has five categories', function () {
    expect(MediaCategory::cases())->toHaveCount(5);
});

it('has expected values', function () {
    expect(collect(MediaCategory::cases())->pluck('value')->all())
        ->toEqual(['hero', 'product', 'people', 'brand', 'downloadable']);
});

it('returns a human label', function () {
    expect(MediaCategory::Hero->label())->toBe('Hero');
    expect(MediaCategory::People->label())->toBe('People');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `php artisan test --compact --filter=MediaCategoryTest`
Expected: FAIL with "Class App\\Enums\\MediaCategory not found".

- [ ] **Step 3: Write the enum**

Create `app/Enums/MediaCategory.php`:

```php
<?php

namespace App\Enums;

enum MediaCategory: string
{
    case Hero = 'hero';
    case Product = 'product';
    case People = 'people';
    case Brand = 'brand';
    case Downloadable = 'downloadable';

    public function label(): string
    {
        return match ($this) {
            self::Hero => 'Hero',
            self::Product => 'Product',
            self::People => 'People',
            self::Brand => 'Brand',
            self::Downloadable => 'Downloadable',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $c) => [$c->value => $c->label()])
            ->all();
    }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `php artisan test --compact --filter=MediaCategoryTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Enums/MediaCategory.php tests/Unit/Enums/MediaCategoryTest.php
git commit -m "feat(media-library): MediaCategory enum"
```

---

## Task 3: Schema migrations

**Files:**
- Create: `database/migrations/2026_04_21_120000_create_media_items_table.php`
- Create: `database/migrations/2026_04_21_120100_create_media_item_attachments_table.php`

- [ ] **Step 1: Write the `media_items` migration**

Create `database/migrations/2026_04_21_120000_create_media_items_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE media_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
                category VARCHAR(32) NOT NULL,
                sub_category VARCHAR(64),
                caption VARCHAR(255),
                alt_text VARCHAR(500),
                created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                legacy_spatie_media_id BIGINT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX media_items_domain_category_idx ON media_items(domain_id, category)');
        DB::statement('CREATE INDEX media_items_domain_subcat_idx ON media_items(domain_id, sub_category)');
        DB::statement('CREATE INDEX media_items_legacy_idx ON media_items(legacy_spatie_media_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS media_items');
    }
};
```

- [ ] **Step 2: Write the `media_item_attachments` migration**

Create `database/migrations/2026_04_21_120100_create_media_item_attachments_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE media_item_attachments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                media_item_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
                attachable_id UUID NOT NULL,
                attachable_type VARCHAR(255) NOT NULL,
                role VARCHAR(64) NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('
            CREATE UNIQUE INDEX media_item_attachments_unique_idx
            ON media_item_attachments(attachable_id, attachable_type, role, media_item_id)
        ');

        DB::statement('CREATE INDEX media_item_attachments_media_item_idx ON media_item_attachments(media_item_id)');
        DB::statement('CREATE INDEX media_item_attachments_morph_idx ON media_item_attachments(attachable_type, attachable_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS media_item_attachments');
    }
};
```

- [ ] **Step 3: Run migrations**

Run: `php artisan migrate`
Expected: both migrations apply cleanly; `\d media_items` shows the expected columns.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_21_120000_create_media_items_table.php \
        database/migrations/2026_04_21_120100_create_media_item_attachments_table.php
git commit -m "feat(media-library): media_items and media_item_attachments tables"
```

---

## Task 4: Path generator

**Files:**
- Create: `app/Support/Media/MediaItemPathGenerator.php`
- Create: `tests/Unit/Support/MediaItemPathGeneratorTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Unit/Support/MediaItemPathGeneratorTest.php`:

```php
<?php

use App\Enums\MediaCategory;
use App\Models\MediaItem;
use App\Support\Media\MediaItemPathGenerator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

beforeEach(function () {
    $this->generator = new MediaItemPathGenerator();
});

it('places domain-scoped items under the domain uuid folder', function () {
    $item = new MediaItem(['domain_id' => '11111111-1111-1111-1111-111111111111', 'category' => MediaCategory::Hero]);
    $item->id = '22222222-2222-2222-2222-222222222222';
    $media = new Media(['id' => 1]);
    $media->setRelation('model', $item);

    expect($this->generator->getPath($media))
        ->toBe('11111111-1111-1111-1111-111111111111/hero/22222222-2222-2222-2222-222222222222/');
});

it('places global items under _global', function () {
    $item = new MediaItem(['domain_id' => null, 'category' => MediaCategory::Brand]);
    $item->id = '33333333-3333-3333-3333-333333333333';
    $media = new Media(['id' => 2]);
    $media->setRelation('model', $item);

    expect($this->generator->getPath($media))
        ->toBe('_global/brand/33333333-3333-3333-3333-333333333333/');
});

it('places conversions in a sibling folder', function () {
    $item = new MediaItem(['domain_id' => null, 'category' => MediaCategory::Hero]);
    $item->id = '44444444-4444-4444-4444-444444444444';
    $media = new Media(['id' => 3]);
    $media->setRelation('model', $item);

    expect($this->generator->getPathForConversions($media))
        ->toBe('_global/hero/44444444-4444-4444-4444-444444444444/conversions/');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `php artisan test --compact --filter=MediaItemPathGeneratorTest`
Expected: FAIL — class missing.

- [ ] **Step 3: Write the path generator**

Create `app/Support/Media/MediaItemPathGenerator.php`:

```php
<?php

namespace App\Support\Media;

use App\Models\MediaItem;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

class MediaItemPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        return $this->basePath($media).'/';
    }

    public function getPathForConversions(Media $media): string
    {
        return $this->basePath($media).'/conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->basePath($media).'/responsive/';
    }

    private function basePath(Media $media): string
    {
        /** @var MediaItem $item */
        $item = $media->model;
        $prefix = $item->domain_id ?: '_global';
        $category = $item->category instanceof \BackedEnum ? $item->category->value : (string) $item->category;

        return sprintf('%s/%s/%s', $prefix, $category, $item->id);
    }
}
```

- [ ] **Step 4: Publish Spatie media-library config**

Run: `php artisan vendor:publish --tag=medialibrary-config`
Expected: `config/media-library.php` created.

- [ ] **Step 5: Point Spatie at our path generator and Bunny disk**

Edit `config/media-library.php`:
- Find `'disk_name' =>` and set value to `env('MEDIA_LIBRARY_DISK', 'bunny')`.
- Find `'path_generator' =>` and set value to `App\Support\Media\MediaItemPathGenerator::class`.

Add to `.env.example`:
```
MEDIA_LIBRARY_DISK=bunny
```

For local test runs, set `MEDIA_LIBRARY_DISK=public` in `.env` until Bunny credentials are wired.

- [ ] **Step 6: Run the unit test to verify it passes**

Run: `php artisan test --compact --filter=MediaItemPathGeneratorTest`
Expected: PASS (note: this test constructs models without saving, so DB is not required).

- [ ] **Step 7: Commit**

```bash
git add app/Support/Media/MediaItemPathGenerator.php \
        tests/Unit/Support/MediaItemPathGeneratorTest.php \
        config/media-library.php .env.example
git commit -m "feat(media-library): custom path generator (domain/category/uuid)"
```

---

## Task 5: MediaItem model

**Files:**
- Create: `app/Models/MediaItem.php`
- Create: `database/factories/MediaItemFactory.php`
- Create: `tests/Unit/Models/MediaItemTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Unit/Models/MediaItemTest.php`:

```php
<?php

use App\Enums\MediaCategory;
use App\Models\Domain;
use App\Models\MediaItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('casts category to the enum', function () {
    $item = MediaItem::factory()->create(['category' => MediaCategory::Hero]);
    expect($item->fresh()->category)->toBe(MediaCategory::Hero);
});

it('scopes to a single domain', function () {
    $a = Domain::factory()->create();
    $b = Domain::factory()->create();
    MediaItem::factory()->create(['domain_id' => $a->id]);
    MediaItem::factory()->create(['domain_id' => $b->id]);

    expect(MediaItem::query()->forDomain($a)->count())->toBe(1);
});

it('scopes to globals', function () {
    $a = Domain::factory()->create();
    MediaItem::factory()->create(['domain_id' => $a->id]);
    MediaItem::factory()->create(['domain_id' => null]);

    expect(MediaItem::query()->global()->count())->toBe(1);
});

it('scopes visible-to union of domain + globals', function () {
    $a = Domain::factory()->create();
    $b = Domain::factory()->create();
    MediaItem::factory()->create(['domain_id' => $a->id]);
    MediaItem::factory()->create(['domain_id' => $b->id]);
    MediaItem::factory()->create(['domain_id' => null]);

    expect(MediaItem::query()->visibleTo($a)->count())->toBe(2);
});
```

- [ ] **Step 2: Write the factory**

Create `database/factories/MediaItemFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Enums\MediaCategory;
use App\Models\MediaItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaItemFactory extends Factory
{
    protected $model = MediaItem::class;

    public function definition(): array
    {
        return [
            'domain_id' => null,
            'category' => MediaCategory::Hero,
            'sub_category' => null,
            'caption' => $this->faker->sentence(3),
            'alt_text' => $this->faker->sentence(5),
            'created_by_user_id' => null,
        ];
    }

    public function global(): static
    {
        return $this->state(['domain_id' => null]);
    }
}
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `php artisan test --compact --filter=MediaItemTest`
Expected: FAIL — model missing.

- [ ] **Step 4: Write the model**

Create `app/Models/MediaItem.php`:

```php
<?php

namespace App\Models;

use App\Enums\MediaCategory;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A library asset — the canonical record for one image or PDF. Owns a single
 * Spatie media row (collection "file") stored on the bunny disk. Owner models
 * point at MediaItems through the media_item_attachments pivot; they do NOT
 * attach Spatie media directly.
 */
class MediaItem extends Model implements HasMedia
{
    use HasFactory, HasUuid, InteractsWithMedia;

    protected $fillable = [
        'domain_id',
        'category',
        'sub_category',
        'caption',
        'alt_text',
        'created_by_user_id',
        'legacy_spatie_media_id',
    ];

    protected function casts(): array
    {
        return [
            'category' => MediaCategory::class,
        ];
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MediaItemAttachmentRow::class);
    }

    public function scopeForDomain(Builder $query, Domain $domain): Builder
    {
        return $query->where('domain_id', $domain->getKey());
    }

    public function scopeGlobal(Builder $query): Builder
    {
        return $query->whereNull('domain_id');
    }

    public function scopeVisibleTo(Builder $query, Domain $domain): Builder
    {
        return $query->where(function (Builder $q) use ($domain) {
            $q->where('domain_id', $domain->getKey())->orWhereNull('domain_id');
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml',
                'application/pdf',
            ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Contain, 320, 320)
            ->performOnCollections('file')
            ->nonOptimized();

        $this->addMediaConversion('preview')
            ->fit(Fit::Contain, 1200, 630)
            ->performOnCollections('file')
            ->nonOptimized();
    }

    public function url(): ?string
    {
        return $this->getFirstMediaUrl('file') ?: null;
    }

    public function thumbUrl(): ?string
    {
        return $this->getFirstMediaUrl('file', 'thumb') ?: null;
    }

    public function previewUrl(): ?string
    {
        return $this->getFirstMediaUrl('file', 'preview') ?: null;
    }

    public function isImage(): bool
    {
        $mime = $this->getFirstMedia('file')?->mime_type;

        return $mime !== null && str_starts_with($mime, 'image/');
    }
}
```

Note: we'll need a tiny `MediaItemAttachmentRow` Eloquent model for the `attachments()` HasMany relation (the other side is a pivot). Create it in Task 6.

- [ ] **Step 5: Run the test to verify it passes (attachments() will fail in a later task — ignore that for now; this task's tests don't hit it)**

Run: `php artisan test --compact --filter=MediaItemTest`
Expected: PASS — all four assertions green.

- [ ] **Step 6: Commit**

```bash
git add app/Models/MediaItem.php database/factories/MediaItemFactory.php \
        tests/Unit/Models/MediaItemTest.php
git commit -m "feat(media-library): MediaItem model with scopes and conversions"
```

---

## Task 6: HasMediaAttachments trait + pivot model

**Files:**
- Create: `app/Models/MediaItemAttachmentRow.php`
- Create: `app/Models/Concerns/HasMediaAttachments.php`
- Create: `tests/Unit/Concerns/HasMediaAttachmentsTest.php`

- [ ] **Step 1: Write the pivot model**

Create `app/Models/MediaItemAttachmentRow.php`:

```php
<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Concrete model for the media_item_attachments pivot so we can query
 * attachments as first-class rows (e.g. "where is MediaItem X used?").
 */
class MediaItemAttachmentRow extends Model
{
    use HasUuid;

    protected $table = 'media_item_attachments';

    protected $fillable = [
        'media_item_id', 'attachable_id', 'attachable_type', 'role', 'sort_order',
    ];

    public function mediaItem(): BelongsTo
    {
        return $this->belongsTo(MediaItem::class);
    }

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

- [ ] **Step 2: Write the failing trait test**

Create `tests/Unit/Concerns/HasMediaAttachmentsTest.php`:

```php
<?php

use App\Models\MediaItem;
use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('sets a single-slot role and replaces existing', function () {
    $summit = Summit::factory()->create();
    $a = MediaItem::factory()->create();
    $b = MediaItem::factory()->create();

    $summit->setMediaFor('hero', $a);
    expect($summit->mediaFor('hero')?->id)->toBe($a->id);

    $summit->setMediaFor('hero', $b);
    expect($summit->mediaFor('hero')?->id)->toBe($b->id);
    expect($summit->mediaAttachments()->wherePivot('role', 'hero')->count())->toBe(1);
});

it('clears a role', function () {
    $summit = Summit::factory()->create();
    $a = MediaItem::factory()->create();
    $summit->setMediaFor('hero', $a);

    $summit->setMediaFor('hero', null);

    expect($summit->mediaFor('hero'))->toBeNull();
});

it('returns ordered gallery attachments', function () {
    $speaker = Speaker::factory()->create();
    $first = MediaItem::factory()->create();
    $second = MediaItem::factory()->create();
    $third = MediaItem::factory()->create();

    $speaker->setGalleryFor('gallery', [$third->id, $first->id, $second->id]);

    expect($speaker->galleryFor('gallery')->pluck('id')->all())
        ->toEqual([$third->id, $first->id, $second->id]);
});
```

- [ ] **Step 3: Write the trait**

Create `app/Models/Concerns/HasMediaAttachments.php`:

```php
<?php

namespace App\Models\Concerns;

use App\Models\MediaItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasMediaAttachments
{
    public function mediaAttachments(): MorphToMany
    {
        return $this->morphToMany(
            MediaItem::class,
            'attachable',
            'media_item_attachments'
        )->withPivot(['role', 'sort_order'])->withTimestamps();
    }

    public function mediaFor(string $role): ?MediaItem
    {
        return $this->mediaAttachments()
            ->wherePivot('role', $role)
            ->orderBy('media_item_attachments.sort_order')
            ->first();
    }

    public function galleryFor(string $role): Collection
    {
        return $this->mediaAttachments()
            ->wherePivot('role', $role)
            ->orderBy('media_item_attachments.sort_order')
            ->get();
    }

    public function setMediaFor(string $role, ?MediaItem $item): void
    {
        $this->mediaAttachments()->wherePivot('role', $role)->detach();
        if ($item !== null) {
            $this->mediaAttachments()->attach($item->getKey(), ['role' => $role, 'sort_order' => 0]);
        }
    }

    /**
     * @param  array<int, string>  $mediaItemIds
     */
    public function setGalleryFor(string $role, array $mediaItemIds): void
    {
        $this->mediaAttachments()->wherePivot('role', $role)->detach();
        foreach (array_values($mediaItemIds) as $index => $id) {
            $this->mediaAttachments()->attach($id, ['role' => $role, 'sort_order' => $index]);
        }
    }
}
```

- [ ] **Step 4: Wire the trait into Summit + Speaker so the test compiles**

Edit `app/Models/Summit.php`:
- Add `use App\Models\Concerns\HasMediaAttachments;` at the top.
- Change class line from `use HasFactory, HasUuid, InteractsWithMedia;` to `use HasFactory, HasUuid, HasMediaAttachments, InteractsWithMedia;`.
  (InteractsWithMedia stays for now; we remove it in Task 9.)

Edit `app/Models/Speaker.php`:
- Same change.

- [ ] **Step 5: Run the test to verify it passes**

Run: `php artisan test --compact --filter=HasMediaAttachmentsTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Models/MediaItemAttachmentRow.php \
        app/Models/Concerns/HasMediaAttachments.php \
        tests/Unit/Concerns/HasMediaAttachmentsTest.php \
        app/Models/Summit.php app/Models/Speaker.php
git commit -m "feat(media-library): HasMediaAttachments trait + pivot model"
```

---

## Task 7: Seed permissions + ScopesTenantViaDomainId trait

**Files:**
- Create: `database/migrations/2026_04_21_120200_seed_media_library_permissions.php`
- Create: `app/Filament/Resources/Concerns/ScopesTenantViaDomainId.php`

- [ ] **Step 1: Write the permissions migration**

Create `database/migrations/2026_04_21_120200_seed_media_library_permissions.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            'media_library.view',
            'media_library.upload',
            'media_library.delete',
            'media_library.delete_in_use',
            'media_library.manage_globals',
        ] as $name) {
            Permission::findOrCreate($name, 'web');
        }
    }

    public function down(): void
    {
        Permission::whereIn('name', [
            'media_library.view',
            'media_library.upload',
            'media_library.delete',
            'media_library.delete_in_use',
            'media_library.manage_globals',
        ])->delete();
    }
};
```

- [ ] **Step 2: Write the tenant-scoping trait**

Create `app/Filament/Resources/Concerns/ScopesTenantViaDomainId.php`:

```php
<?php

namespace App\Filament\Resources\Concerns;

use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * For resources whose model has a direct `domain_id` column and whose Filament
 * tenant is a Domain. Scopes to rows whose domain_id matches the current tenant
 * OR is NULL (platform-global items). Used by MediaItemResource.
 */
trait ScopesTenantViaDomainId
{
    public static function scopeEloquentQueryToTenant(Builder $query, ?Model $tenant): Builder
    {
        $tenant ??= Filament::getTenant();
        if (! $tenant) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($tenant) {
            $q->where('domain_id', $tenant->getKey())->orWhereNull('domain_id');
        });
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'domain';
    }

    public static function observeTenancyModelCreation(Panel $panel): void {}
}
```

- [ ] **Step 3: Run the migration**

Run: `php artisan migrate`
Expected: permissions seeded.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_21_120200_seed_media_library_permissions.php \
        app/Filament/Resources/Concerns/ScopesTenantViaDomainId.php
git commit -m "feat(media-library): seed permissions + ScopesTenantViaDomainId trait"
```

---

## Task 8: Filament MediaItemResource (list + upload + delete + usage)

**Files:**
- Create: `app/Filament/Resources/MediaItems/MediaItemResource.php`
- Create: `app/Filament/Resources/MediaItems/Pages/ListMediaItems.php`
- Create: `tests/Feature/MediaLibrary/MediaItemResourceTest.php`

- [ ] **Step 1: Write the failing feature test**

Create `tests/Feature/MediaLibrary/MediaItemResourceTest.php`:

```php
<?php

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\MediaItemResource;
use App\Filament\Resources\MediaItems\Pages\ListMediaItems;
use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');

    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->create();
    $this->user->domains()->attach($this->domain);
    $this->user->givePermissionTo(['media_library.view', 'media_library.upload', 'media_library.delete']);

    $this->actingAs($this->user);
    Filament::setTenant($this->domain);
});

it('lists own-domain and global items, hides other domains', function () {
    $mine = MediaItem::factory()->create(['domain_id' => $this->domain->id]);
    $global = MediaItem::factory()->create(['domain_id' => null]);
    $otherDomain = Domain::factory()->create();
    $hidden = MediaItem::factory()->create(['domain_id' => $otherDomain->id]);

    livewire(ListMediaItems::class)
        ->assertCanSeeTableRecords([$mine, $global])
        ->assertCanNotSeeTableRecords([$hidden]);
});

it('guards delete when item has attachments', function () {
    $item = MediaItem::factory()->create(['domain_id' => $this->domain->id]);
    \DB::table('media_item_attachments')->insert([
        'id' => \Illuminate\Support\Str::uuid(),
        'media_item_id' => $item->id,
        'attachable_id' => \Illuminate\Support\Str::uuid(),
        'attachable_type' => 'App\\Models\\Summit',
        'role' => 'hero',
        'sort_order' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    livewire(ListMediaItems::class)
        ->callTableAction('delete', $item)
        ->assertNotified('In use');

    expect(MediaItem::find($item->id))->not->toBeNull();
});
```

- [ ] **Step 2: Write the resource**

Create `app/Filament/Resources/MediaItems/MediaItemResource.php`:

```php
<?php

namespace App\Filament\Resources\MediaItems;

use App\Enums\MediaCategory;
use App\Filament\Resources\Concerns\ScopesTenantViaDomainId;
use App\Models\MediaItem;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class MediaItemResource extends Resource
{
    use ScopesTenantViaDomainId;

    protected static ?string $model = MediaItem::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::Photo;

    protected static ?string $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'Media library';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('category')
                ->options(MediaCategory::options())
                ->required(),
            TextInput::make('sub_category')->maxLength(64),
            TextInput::make('caption')->maxLength(255),
            TextInput::make('alt_text')->maxLength(500),
            FileUpload::make('file_upload')
                ->label('File')
                ->disk(config('media-library.disk_name'))
                ->image()
                ->acceptedFileTypes([
                    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
                    'image/svg+xml', 'application/pdf',
                ])
                ->preserveFilenames()
                ->required()
                ->dehydrated(false)
                ->afterStateUpdated(function ($state, $record) {
                    if ($record && $state) {
                        $record->clearMediaCollection('file');
                        $record->addMediaFromDisk($state, config('media-library.disk_name'))
                            ->toMediaCollection('file');
                    }
                }),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('thumb')
                    ->state(fn (MediaItem $r) => $r->thumbUrl()),
                TextColumn::make('category')->badge()->sortable(),
                TextColumn::make('sub_category')->toggleable(),
                TextColumn::make('caption')->searchable(),
                TextColumn::make('usage_count')
                    ->label('Used in')
                    ->state(fn (MediaItem $r) => $r->attachments()->count().' places'),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('category')->options(MediaCategory::options()),
                SelectFilter::make('scope')
                    ->options(['mine' => 'This domain', 'global' => 'Global'])
                    ->query(function (Builder $query, array $data) {
                        if (($data['value'] ?? null) === 'global') {
                            $query->whereNull('domain_id');
                        } elseif (($data['value'] ?? null) === 'mine') {
                            $query->whereNotNull('domain_id');
                        }
                    }),
            ])
            ->recordActions([
                DeleteAction::make()
                    ->before(function (MediaItem $record, DeleteAction $action) {
                        if ($record->attachments()->count() > 0) {
                            \Filament\Notifications\Notification::make()
                                ->title('In use')
                                ->body('This item is attached to one or more records. Detach it first.')
                                ->danger()
                                ->send();
                            $action->cancel();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMediaItems::route('/'),
        ];
    }
}
```

- [ ] **Step 3: Write the List page**

Create `app/Filament/Resources/MediaItems/Pages/ListMediaItems.php`:

```php
<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMediaItems extends ListRecords
{
    protected static string $resource = MediaItemResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
```

- [ ] **Step 4: Register the resource in the Filament panel provider**

Find the Filament Panel provider (usually `app/Providers/Filament/AdminPanelProvider.php`) and add `MediaItemResource::class` to the `resources([])` array, or ensure auto-discovery covers `app/Filament/Resources/MediaItems`. If auto-discovery is in use (check the provider), no edit is needed.

- [ ] **Step 5: Run the test to verify it passes**

Run: `php artisan test --compact --filter=MediaItemResourceTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Filament/Resources/MediaItems \
        tests/Feature/MediaLibrary/MediaItemResourceTest.php
git commit -m "feat(media-library): MediaItemResource with tenant scoping + delete guard"
```

---

## Task 9: MediaPickerInput custom Filament field

**Files:**
- Create: `app/Filament/Forms/Components/MediaPickerInput.php`
- Create: `resources/views/filament/forms/components/media-picker-input.blade.php`
- Create: `tests/Feature/MediaLibrary/MediaPickerInputTest.php`

- [ ] **Step 1: Write the failing picker test**

Create `tests/Feature/MediaLibrary/MediaPickerInputTest.php`:

```php
<?php

use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\Product;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Livewire\livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->create();
    $this->user->domains()->attach($this->domain);
    $this->user->givePermissionTo(['media_library.view', 'media_library.upload']);
    $this->actingAs($this->user);
    Filament::setTenant($this->domain);

    $this->summit = Summit::factory()->create();
    $this->summit->domains()->attach($this->domain);
});

it('writes a pivot row when a library item is picked for a single-slot role', function () {
    $product = Product::factory()->create(['summit_id' => $this->summit->id]);
    $item = MediaItem::factory()->create(['domain_id' => $this->domain->id]);

    livewire(\App\Filament\Resources\Products\ProductResource\Pages\EditProduct::class, ['record' => $product->id])
        ->fillForm(['image_media_item_id' => $item->id])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($product->fresh()->mediaFor('image')?->id)->toBe($item->id);
});
```

(The exact resource page name for Product may differ — verify with `ls app/Filament/Resources/Products/Pages` and adjust the use statement.)

- [ ] **Step 2: Write the Blade view**

Create `resources/views/filament/forms/components/media-picker-input.blade.php`:

```blade
<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    @php
        $itemId = $getState();
        $item = $itemId ? \App\Models\MediaItem::find($itemId) : null;
    @endphp

    <div
        x-data="{ open: false, selected: @js($itemId) }"
        @media-picker-selected.window="if ($event.detail.fieldId === @js($getStatePath())) { selected = $event.detail.itemId; $wire.set(@js($getStatePath()), $event.detail.itemId); }"
        class="flex flex-col gap-2"
    >
        <div class="flex items-center gap-3">
            <div class="w-32 h-32 border border-dashed rounded overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                @if ($item?->thumbUrl())
                    <img src="{{ $item->thumbUrl() }}" alt="{{ $item->alt_text }}" class="object-contain w-full h-full">
                @else
                    <span class="text-sm text-gray-400">No image</span>
                @endif
            </div>
            <div class="flex gap-2">
                <x-filament::button
                    color="gray"
                    wire:click="$dispatch('open-media-picker', {{ json_encode([
                        'fieldId' => $getStatePath(),
                        'category' => $getCategory(),
                        'role' => $getRole(),
                    ]) }})"
                >{{ $item ? 'Replace' : 'Choose image' }}</x-filament::button>

                @if ($item)
                    <x-filament::button
                        color="danger"
                        wire:click="$set('{{ $getStatePath() }}', null)"
                    >Clear</x-filament::button>
                @endif
            </div>
        </div>
    </div>
</x-dynamic-component>
```

- [ ] **Step 3: Write the custom field class**

Create `app/Filament/Forms/Components/MediaPickerInput.php`:

```php
<?php

namespace App\Filament\Forms\Components;

use App\Models\MediaItem;
use Filament\Forms\Components\Field;

/**
 * Custom Filament form field: opens a library modal for picking (or uploading
 * new) a MediaItem. Stores the picked MediaItem UUID on the form record and,
 * after the record is saved, writes a media_item_attachments pivot row via
 * HasMediaAttachments::setMediaFor().
 *
 * Usage:
 *   MediaPickerInput::make('image')->category('product')->role('image');
 */
class MediaPickerInput extends Field
{
    protected string $view = 'filament.forms.components.media-picker-input';

    protected string $category = 'product';

    protected string $role = 'image';

    public function category(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function role(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Hydrate from existing attachment pivot.
        $this->afterStateHydrated(function (MediaPickerInput $component, $state) {
            if ($state !== null) {
                return;
            }
            $record = $component->getRecord();
            if ($record && method_exists($record, 'mediaFor')) {
                $component->state($record->mediaFor($component->getRole())?->getKey());
            }
        });

        // Dehydrate by writing the pivot after the record saves.
        $this->dehydrated(false);
        $this->afterStateUpdated(function () {
            // nothing during form edits; pivot writes happen in saved hook
        });
        $this->saveRelationshipsUsing(function (MediaPickerInput $component, $state) {
            $record = $component->getRecord();
            if (! $record || ! method_exists($record, 'setMediaFor')) {
                return;
            }
            $item = $state ? MediaItem::find($state) : null;
            $record->setMediaFor($component->getRole(), $item);
        });
    }
}
```

- [ ] **Step 4: Write the picker modal Livewire component**

For the modal UI, reuse Filament's native modal via a page-level Livewire listener on the form's owning page. Skip building a separate modal component in v1; instead, the picker field dispatches `open-media-picker` and the Filament panel's resource page renders a modal when that event fires.

Add to the relevant resource pages (Task 10 covers this per resource). For v1, the MVP can be:
- Selecting an **existing** item via a `Select` dropdown seeded with library items (search-enabled).
- "Upload new" handled through a separate `Create MediaItem` action that the operator can pre-run.

Replace the Blade template "Choose image" button with a Filament `Select` component rendered inline; this gets us to a working picker without building a modal in v1. Revisit in a follow-up if operators find the dropdown insufficient.

Simplified v1 `MediaPickerInput` view — replace the Blade file with:

```blade
<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    @php
        $itemId = $getState();
        $item = $itemId ? \App\Models\MediaItem::find($itemId) : null;
        $options = \App\Models\MediaItem::query()
            ->visibleTo(\Filament\Facades\Filament::getTenant())
            ->where('category', $getCategory())
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->mapWithKeys(fn ($i) => [$i->id => ($i->caption ?: $i->id).' ('.($i->sub_category ?: 'uncategorized').')'])
            ->all();
    @endphp

    <div class="flex gap-4 items-start">
        <div class="w-32 h-32 border border-dashed rounded overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            @if ($item?->thumbUrl())
                <img src="{{ $item->thumbUrl() }}" alt="{{ $item->alt_text }}" class="object-contain w-full h-full">
            @else
                <span class="text-xs text-gray-400 text-center px-2">No image</span>
            @endif
        </div>

        <div class="flex-1">
            <select
                wire:model.live="data.{{ $getStatePath(false) }}"
                class="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
                <option value="">— Select from library —</option>
                @foreach ($options as $id => $label)
                    <option value="{{ $id }}" @selected($itemId === $id)>{{ $label }}</option>
                @endforeach
            </select>
            <p class="mt-1 text-xs text-gray-500">
                Don't see it? <a href="{{ route('filament.admin.resources.media-items.index', ['tenant' => \Filament\Facades\Filament::getTenant()?->slug]) }}" class="underline">Upload to the library</a> first, then return here.
            </p>
        </div>
    </div>
</x-dynamic-component>
```

Note: the modal-with-inline-upload UX described in the spec is deferred to a follow-up task. v1 ships the dropdown + link-to-library, which is enough to validate the end-to-end picker flow.

- [ ] **Step 5: Run the test to verify it passes**

Run: `php artisan test --compact --filter=MediaPickerInputTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Filament/Forms/Components/MediaPickerInput.php \
        resources/views/filament/forms/components/media-picker-input.blade.php \
        tests/Feature/MediaLibrary/MediaPickerInputTest.php
git commit -m "feat(media-library): MediaPickerInput Filament field (v1 dropdown)"
```

---

## Task 10: Swap existing resources onto MediaPickerInput

Each model+resource follows the same recipe. The pattern is: (a) remove `HasMedia`/`InteractsWithMedia` + `registerMediaCollections`/`registerMediaConversions` from the model; (b) add `HasMediaAttachments` (if not already added in Task 6); (c) replace `SpatieMediaLibraryFileUpload` with `MediaPickerInput` in the Filament resource.

- [ ] **Step 1: Summit**

Edit `app/Models/Summit.php`:
- Remove `implements HasMedia` from the class declaration (keep other interfaces).
- Remove `InteractsWithMedia` from the `use` list inside the class.
- Delete `registerMediaCollections()` and `registerMediaConversions()` methods.
- Remove the `use Spatie\MediaLibrary\*` imports that are no longer used.
- Verify `HasMediaAttachments` is present (added in Task 6).

Edit `app/Filament/Resources/Summits/SummitResource.php`:
- Replace `use Filament\Forms\Components\SpatieMediaLibraryFileUpload;` with `use App\Filament\Forms\Components\MediaPickerInput;`.
- Replace the `SpatieMediaLibraryFileUpload::make('hero')...` block with:

```php
MediaPickerInput::make('hero_media_item_id')
    ->category('hero')
    ->role('hero')
    ->label('Hero image'),
```

Run: `php artisan test --compact --filter=Summit`
Expected: existing Summit tests still pass.

Commit:
```bash
git add app/Models/Summit.php app/Filament/Resources/Summits/SummitResource.php
git commit -m "feat(media-library): Summit uses MediaPickerInput"
```

- [ ] **Step 2: Product**

Edit `app/Models/Product.php`:
- Same removals as Summit.
- Add `use App\Models\Concerns\HasMediaAttachments;` and include in the `use` list inside the class.

Edit `app/Filament/Resources/Products/ProductResource.php`:
- Swap import and field for `MediaPickerInput::make('image_media_item_id')->category('product')->role('image')->label('Image')`.

Run: `php artisan test --compact --filter=Product`

Commit:
```bash
git add app/Models/Product.php app/Filament/Resources/Products/ProductResource.php
git commit -m "feat(media-library): Product uses MediaPickerInput"
```

- [ ] **Step 3: Speaker**

Edit `app/Models/Speaker.php`:
- Same removals. `HasMediaAttachments` already added in Task 6.

Edit `app/Filament/Resources/Speakers/SpeakerResource.php`:
- Swap for `MediaPickerInput::make('photo_media_item_id')->category('people')->role('photo')->label('Photo')`.

Run: `php artisan test --compact --filter=Speaker`

Commit:
```bash
git add app/Models/Speaker.php app/Filament/Resources/Speakers/SpeakerResource.php
git commit -m "feat(media-library): Speaker uses MediaPickerInput"
```

- [ ] **Step 4: FunnelStepBump**

Edit `app/Models/FunnelStepBump.php`:
- Same removals. Add `HasMediaAttachments`.

Edit `app/Filament/Resources/FunnelStepBumps/FunnelStepBumpResource.php`:
- Swap for `MediaPickerInput::make('image_media_item_id')->category('product')->role('image')->label('Image')`.

Run: `php artisan test --compact --filter=FunnelStepBump`

Commit:
```bash
git add app/Models/FunnelStepBump.php \
        app/Filament/Resources/FunnelStepBumps/FunnelStepBumpResource.php
git commit -m "feat(media-library): FunnelStepBump uses MediaPickerInput"
```

- [ ] **Step 5: Domain**

Edit `app/Models/Domain.php`:
- Same removals. Add `HasMediaAttachments`.

Edit `app/Filament/Resources/Domains/DomainResource.php`:
- Swap for `MediaPickerInput::make('logo_media_item_id')->category('brand')->role('logo')->label('Logo')`.

Run: `php artisan test --compact --filter=Domain`

Commit:
```bash
git add app/Models/Domain.php app/Filament/Resources/Domains/DomainResource.php
git commit -m "feat(media-library): Domain uses MediaPickerInput"
```

- [ ] **Step 6: AppSettings**

Edit `app/Models/AppSettings.php`:
- Same removals. Add `HasMediaAttachments`.

Edit `app/Filament/Pages/Settings.php`:
- Swap for `MediaPickerInput::make('logo_media_item_id')->category('brand')->role('logo')->label('Logo')`.

Run: `php artisan test --compact --filter=Settings`

Commit:
```bash
git add app/Models/AppSettings.php app/Filament/Pages/Settings.php
git commit -m "feat(media-library): AppSettings uses MediaPickerInput"
```

---

## Task 11: Migration command — move legacy media into the library

**Files:**
- Create: `app/Console/Commands/MediaLibraryMigrateCommand.php`
- Create: `tests/Feature/MediaLibrary/MediaLibraryMigrateCommandTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/MediaLibrary/MediaLibraryMigrateCommandTest.php`:

```php
<?php

use App\Enums\MediaCategory;
use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');
});

it('migrates a Summit hero media row into the library', function () {
    $summit = Summit::factory()->create();
    $domain = Domain::factory()->create();
    $summit->domains()->attach($domain);

    // Seed a legacy Spatie media row on Summit (using the legacy "hero" collection).
    // NOTE: this test runs BEFORE Task 10 removes HasMedia from Summit.
    // If you're running the plan in order, this test file can be added pre-Task-10 and the
    // assertion about Summit still implementing HasMedia held; after Task 10 the legacy
    // setup needs to be stubbed directly by inserting into the `media` table.

    \DB::table('media')->insert([
        'id' => 9999,
        'model_type' => Summit::class,
        'model_id' => $summit->id,
        'uuid' => \Illuminate\Support\Str::uuid(),
        'collection_name' => 'hero',
        'name' => 'legacy',
        'file_name' => 'legacy.png',
        'mime_type' => 'image/png',
        'disk' => 'public',
        'size' => 10,
        'manipulations' => '[]',
        'custom_properties' => '[]',
        'generated_conversions' => '[]',
        'responsive_images' => '[]',
        'order_column' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    Storage::disk('public')->put('9999/legacy.png', 'fake-bytes');

    $this->artisan('media-library:migrate')->assertSuccessful();

    $item = MediaItem::where('legacy_spatie_media_id', 9999)->first();
    expect($item)->not->toBeNull();
    expect($item->category)->toBe(MediaCategory::Hero);
    expect($item->domain_id)->toBe($domain->id);

    expect(\DB::table('media_item_attachments')
        ->where('attachable_id', $summit->id)
        ->where('role', 'hero')->count())->toBe(1);
});

it('is idempotent on re-run', function () {
    Summit::factory()->create();
    \DB::table('media')->insert([
        'id' => 9998,
        'model_type' => Summit::class,
        'model_id' => Summit::factory()->create()->id,
        'uuid' => \Illuminate\Support\Str::uuid(),
        'collection_name' => 'hero',
        'name' => 'legacy',
        'file_name' => 'legacy.png',
        'mime_type' => 'image/png',
        'disk' => 'public',
        'size' => 10,
        'manipulations' => '[]', 'custom_properties' => '[]',
        'generated_conversions' => '[]', 'responsive_images' => '[]',
        'order_column' => 1,
        'created_at' => now(), 'updated_at' => now(),
    ]);
    Storage::disk('public')->put('9998/legacy.png', 'fake');

    $this->artisan('media-library:migrate')->assertSuccessful();
    $firstCount = MediaItem::count();

    $this->artisan('media-library:migrate')->assertSuccessful();
    expect(MediaItem::count())->toBe($firstCount);
});
```

- [ ] **Step 2: Write the command**

Create `app/Console/Commands/MediaLibraryMigrateCommand.php`:

```php
<?php

namespace App\Console\Commands;

use App\Enums\MediaCategory;
use App\Models\AppSettings;
use App\Models\Domain;
use App\Models\FunnelStepBump;
use App\Models\MediaItem;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaLibraryMigrateCommand extends Command
{
    protected $signature = 'media-library:migrate
        {--dry-run : Report counts and mappings without writing}
        {--model= : Migrate a single model class short-name (Summit, Product, ...)}';

    protected $description = 'Move legacy Spatie media rows into the MediaItem library';

    /**
     * @var array<class-string, array{category: MediaCategory, subCategory: string|null, role: string}>
     */
    private array $map = [];

    public function handle(): int
    {
        $this->map = [
            Summit::class => ['category' => MediaCategory::Hero, 'subCategory' => 'summit', 'role' => 'hero'],
            Product::class => ['category' => MediaCategory::Product, 'subCategory' => 'main', 'role' => 'image'],
            FunnelStepBump::class => ['category' => MediaCategory::Product, 'subCategory' => 'bump', 'role' => 'image'],
            Speaker::class => ['category' => MediaCategory::People, 'subCategory' => 'speaker', 'role' => 'photo'],
            Domain::class => ['category' => MediaCategory::Brand, 'subCategory' => 'primary', 'role' => 'logo'],
            AppSettings::class => ['category' => MediaCategory::Brand, 'subCategory' => 'primary', 'role' => 'logo'],
        ];

        $modelFilter = $this->option('model');
        $dryRun = (bool) $this->option('dry-run');

        $targetClasses = $modelFilter
            ? array_filter(array_keys($this->map), fn ($cls) => class_basename($cls) === $modelFilter)
            : array_keys($this->map);

        $total = 0;

        foreach ($targetClasses as $class) {
            $rows = DB::table('media')->where('model_type', $class)->get();
            $this->info("{$class}: {$rows->count()} legacy rows");

            foreach ($rows as $row) {
                if (MediaItem::where('legacy_spatie_media_id', $row->id)->exists()) {
                    continue;
                }

                if ($dryRun) {
                    $total++;
                    continue;
                }

                $this->migrateOne($class, $row);
                $total++;
            }
        }

        $this->info(($dryRun ? '[DRY] ' : '')."Migrated {$total} media rows.");

        return self::SUCCESS;
    }

    private function migrateOne(string $class, object $row): void
    {
        $map = $this->map[$class];
        $owner = $class::find($row->model_id);
        if (! $owner) {
            $this->warn("  skipped media id={$row->id}: owner not found");

            return;
        }

        $domainId = $this->resolveDomainId($owner, $class);

        $item = MediaItem::create([
            'domain_id' => $domainId,
            'category' => $map['category'],
            'sub_category' => $map['subCategory'],
            'caption' => $row->name,
            'alt_text' => $row->name,
            'created_by_user_id' => null,
            'legacy_spatie_media_id' => $row->id,
        ]);

        $sourceDisk = $row->disk;
        $sourcePath = "{$row->id}/{$row->file_name}";
        $absolute = Storage::disk($sourceDisk)->path($sourcePath);

        if (! file_exists($absolute)) {
            $this->warn("  skipped media id={$row->id}: source file missing at {$absolute}");
            $item->delete();

            return;
        }

        $item->addMedia($absolute)
            ->preservingOriginal()
            ->toMediaCollection('file');

        DB::table('media_item_attachments')->insert([
            'id' => (string) Str::uuid(),
            'media_item_id' => $item->id,
            'attachable_id' => $owner->getKey(),
            'attachable_type' => $class,
            'role' => $map['role'],
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function resolveDomainId(object $owner, string $class): ?string
    {
        return match ($class) {
            Summit::class => $owner->domains()->first()?->id,
            Product::class, Speaker::class, FunnelStepBump::class
                => $owner->summit?->domains()->first()?->id,
            Domain::class => $owner->id,
            AppSettings::class => null,
            default => null,
        };
    }
}
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `php artisan test --compact --filter=MediaLibraryMigrateCommandTest`
Expected: PASS (both scenarios — first migration and idempotent re-run).

- [ ] **Step 4: Commit**

```bash
git add app/Console/Commands/MediaLibraryMigrateCommand.php \
        tests/Feature/MediaLibrary/MediaLibraryMigrateCommandTest.php
git commit -m "feat(media-library): one-shot legacy-media migration command"
```

---

## Task 12: Drop legacy command + final cleanup

**Files:**
- Create: `app/Console/Commands/MediaLibraryDropLegacyCommand.php`

- [ ] **Step 1: Write the drop command**

Create `app/Console/Commands/MediaLibraryDropLegacyCommand.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\AppSettings;
use App\Models\Domain;
use App\Models\FunnelStepBump;
use App\Models\MediaItem;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MediaLibraryDropLegacyCommand extends Command
{
    protected $signature = 'media-library:drop-legacy {--confirm : Actually delete files and rows}';

    protected $description = 'After migration soak: delete legacy Spatie media rows from the 6 migrated models';

    public function handle(): int
    {
        $classes = [
            Summit::class, Product::class, FunnelStepBump::class,
            Speaker::class, Domain::class, AppSettings::class,
        ];

        $unmigrated = DB::table('media')
            ->whereIn('model_type', $classes)
            ->whereNotIn('id', MediaItem::whereNotNull('legacy_spatie_media_id')->pluck('legacy_spatie_media_id'))
            ->count();

        if ($unmigrated > 0) {
            $this->error("Refusing to drop: {$unmigrated} legacy rows have no corresponding MediaItem. Run media-library:migrate first.");

            return self::FAILURE;
        }

        $rows = DB::table('media')->whereIn('model_type', $classes)->get();
        $this->info("Would delete {$rows->count()} legacy media rows and their files.");

        if (! $this->option('confirm')) {
            $this->warn('Dry run. Pass --confirm to actually delete.');

            return self::SUCCESS;
        }

        foreach ($rows as $row) {
            $path = "{$row->id}/{$row->file_name}";
            Storage::disk($row->disk)->delete($path);
            Storage::disk($row->disk)->deleteDirectory((string) $row->id);
        }

        DB::table('media')->whereIn('model_type', $classes)->delete();
        $this->info('Legacy rows deleted.');

        return self::SUCCESS;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Console/Commands/MediaLibraryDropLegacyCommand.php
git commit -m "feat(media-library): drop-legacy cleanup command (gated by --confirm)"
```

---

## Task 13: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `php artisan test --compact`
Expected: all tests green. Any red indicates a regression — investigate before proceeding.

- [ ] **Step 2: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`
Expected: formatting applied to touched files. Commit the formatting changes if any:

```bash
git add -u
git commit -m "chore: pint"
```

- [ ] **Step 3: Manual smoke test (Filament admin)**

Run `composer dev`. In a browser:
1. Log in as a domain admin.
2. Navigate to **Content → Media library**. Confirm the grid renders, upload an image. Confirm the item appears.
3. Open **Summits → [any] → Edit**. Confirm the Hero field is now a MediaPickerInput dropdown. Select the item uploaded in step 2. Save. Confirm the thumbnail renders.
4. Repeat for Product, Speaker, FunnelStepBump, Domain, AppSettings.
5. Delete the library item while it's attached; confirm the delete guard fires.

- [ ] **Step 4: If the platform has production data, plan a production migration**

(Out of this plan's scope; document the production cutover separately: run `media-library:migrate --dry-run` first, then live, then soak 7 days, then `media-library:drop-legacy --confirm`.)

---

## Self-review notes

- **Spec coverage:** Every section of the design spec maps to a task — disk (T1), enum (T2), schema (T3), path generator (T4), MediaItem (T5), trait (T6), permissions + tenant trait (T7), Filament resource + delete guard + tenant scoping (T8), picker field (T9), swap-over of all 6 consumers (T10), migration (T11), drop-legacy (T12), verification (T13).
- **Deferred explicitly in T9:** the modal-with-inline-upload UX. v1 ships a dropdown picker with a deep-link to the library for upload. This trade is flagged in Task 9; add a follow-up task if operators report friction.
- **Category mapping mirrors the spec's table.** Logos map to `brand` (not `hero`) per the 5-category taxonomy.
- **One thing to revisit post-v1:** the `alt_text` required-on-attach accessibility rule in the spec is not enforced in code yet. Add a validation rule on `MediaPickerInput` in a follow-up — `->rule(fn () => fn ($attr, $value, $fail) => MediaItem::find($value)?->alt_text ? null : $fail('Selected image is missing alt text.'))`.

## Execution handoff

This plan is ready to execute. Two options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task; review between tasks; fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans; batch execution with checkpoints for review.
