<?php

use App\Enums\MediaCategory;
use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');
});

it('migrates a Summit hero media row into the library', function () {
    $domain = Domain::factory()->create();
    $summit = Summit::factory()->create(['domain_id' => $domain->id]);

    DB::table('media')->insert([
        'id' => 9999,
        'model_type' => Summit::class,
        'model_id' => $summit->id,
        'uuid' => Str::uuid(),
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
    expect($item->category)->toBe(MediaCategory::LandingPage);
    expect($item->domain_id)->toBe($domain->id);

    expect(DB::table('media_item_attachments')
        ->where('attachable_id', $summit->id)
        ->where('role', 'hero')->count())->toBe(1);
});

it('is idempotent on re-run', function () {
    DB::table('media')->insert([
        'id' => 9998,
        'model_type' => Summit::class,
        'model_id' => Summit::factory()->create()->id,
        'uuid' => Str::uuid(),
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
