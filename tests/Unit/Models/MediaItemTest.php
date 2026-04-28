<?php

use App\Enums\MediaCategory;
use App\Models\MediaItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('casts category to the enum', function () {
    $item = MediaItem::factory()->create(['category' => MediaCategory::LandingPage]);
    expect($item->fresh()->category)->toBe(MediaCategory::LandingPage);
});

it('is global — no domain scoping', function () {
    MediaItem::factory()->count(3)->create();

    expect(MediaItem::query()->count())->toBe(3);
});
