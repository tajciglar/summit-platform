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
