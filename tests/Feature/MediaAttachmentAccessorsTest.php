<?php

use App\Models\MediaItem;
use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');
});

function makeAttachedMediaItem(array $attrs = []): MediaItem
{
    $item = MediaItem::factory()->create($attrs);
    $item->addMedia(UploadedFile::fake()->image('fixture.png'))
        ->toMediaCollection('file');

    return $item->fresh();
}

it('Speaker.photo_url falls back to the mediaFor(photo) URL when set', function () {
    $summit = Summit::factory()->create();
    $speaker = Speaker::factory()->forSummit($summit)->create([
        'photo_url' => 'https://legacy.example/old.jpg',
    ]);

    expect($speaker->photo_url)->toBe('https://legacy.example/old.jpg');

    $item = makeAttachedMediaItem();
    $speaker->setMediaFor('photo', $item);

    $picked = $speaker->fresh()->photo_url;
    expect($picked)->not->toBe('https://legacy.example/old.jpg');
    expect($picked)->toContain($item->id);
});

it('Speaker.photo_url keeps the legacy column when no picker attachment exists', function () {
    $summit = Summit::factory()->create();
    $speaker = Speaker::factory()->forSummit($summit)->create([
        'photo_url' => 'https://legacy.example/kept.jpg',
    ]);

    expect($speaker->photo_url)->toBe('https://legacy.example/kept.jpg');
});

it('mediaFor helper on the trait exposes a URL shortcut', function () {
    $summit = Summit::factory()->create();
    $speaker = Speaker::factory()->forSummit($summit->id)->create();

    expect($speaker->imageUrl('photo'))->toBeNull();

    $item = makeAttachedMediaItem();
    $speaker->setMediaFor('photo', $item);

    expect($speaker->fresh()->imageUrl('photo'))->toContain($item->id);
});
