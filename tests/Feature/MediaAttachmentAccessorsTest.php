<?php

use App\Models\Domain;
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
    $speaker = Speaker::factory()->create([
        'summit_id' => $summit->id,
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
    $speaker = Speaker::factory()->create([
        'summit_id' => $summit->id,
        'photo_url' => 'https://legacy.example/kept.jpg',
    ]);

    expect($speaker->photo_url)->toBe('https://legacy.example/kept.jpg');
});

it('Summit.hero_image_url prefers the picker attachment', function () {
    $domain = Domain::factory()->create();
    $summit = Summit::factory()->create([
        'domain_id' => $domain->id,
        'hero_image_url' => 'https://legacy.example/hero.jpg',
    ]);

    expect($summit->hero_image_url)->toBe('https://legacy.example/hero.jpg');

    $item = makeAttachedMediaItem(['domain_id' => $domain->id]);
    $summit->setMediaFor('hero', $item);

    expect($summit->fresh()->hero_image_url)->toContain($item->id);
});

it('mediaFor helper on the trait exposes a URL shortcut', function () {
    $summit = Summit::factory()->create();
    $speaker = Speaker::factory()->create(['summit_id' => $summit->id]);

    expect($speaker->imageUrl('photo'))->toBeNull();

    $item = makeAttachedMediaItem();
    $speaker->setMediaFor('photo', $item);

    expect($speaker->fresh()->imageUrl('photo'))->toContain($item->id);
});
