<?php

use App\Models\MediaItem;
use App\Services\Templates\MediaContentResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('replaces media-id fields with resolved sidecars', function () {
    $item = MediaItem::factory()->create(['category' => 'landing_page']);

    $content = [
        'hero' => [
            'headline' => 'Hello',
            'backgroundImageId' => $item->id,
        ],
        'footer' => [
            'logoMediaId' => null,
        ],
    ];

    $resolved = app(MediaContentResolver::class)->resolve($content);

    expect($resolved['hero']['headline'])->toBe('Hello');
    expect($resolved['hero']['backgroundImageId'])->toBe($item->id);
    expect($resolved['hero']['backgroundImage'])->toBeArray();
    expect($resolved['hero']['backgroundImage'])->toHaveKey('url');
    expect($resolved['hero']['backgroundImage']['id'])->toBe($item->id);
    expect($resolved['footer'])->not->toHaveKey('logo');
});

it('handles arrays of objects with media ids', function () {
    $item = MediaItem::factory()->create();
    $content = [
        'bonuses' => [
            'items' => [
                ['title' => 'A', 'thumbnailMediaId' => $item->id],
                ['title' => 'B', 'thumbnailMediaId' => null],
            ],
        ],
    ];

    $resolved = app(MediaContentResolver::class)->resolve($content);

    expect($resolved['bonuses']['items'][0]['thumbnail'])->toBeArray();
    expect($resolved['bonuses']['items'][1])->not->toHaveKey('thumbnail');
});

it('skips sidecars for unresolved ids', function () {
    $content = [
        'hero' => ['backgroundImageId' => '00000000-0000-0000-0000-000000000000'],
    ];

    $resolved = app(MediaContentResolver::class)->resolve($content);

    expect($resolved['hero'])->not->toHaveKey('backgroundImage');
});

it('is a no-op on content without media-id fields', function () {
    $content = ['hero' => ['headline' => 'Hi', 'sub' => 'There']];

    expect(app(MediaContentResolver::class)->resolve($content))->toBe($content);
});
