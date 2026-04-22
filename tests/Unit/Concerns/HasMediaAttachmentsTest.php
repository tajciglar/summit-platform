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
