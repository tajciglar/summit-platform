<?php

use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\User;
use App\Services\Media\MediaItemCreator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['media-library.disk_name' => 'public']);
    Storage::fake('public');
});

it('creates a MediaItem and stores the file on the configured disk, converting raster images to WebP', function () {
    $domain = Domain::factory()->create();
    $user = User::factory()->create();
    $upload = UploadedFile::fake()->image('hero.jpg', 800, 600);

    $item = app(MediaItemCreator::class)->fromUpload(
        source: $upload,
        category: 'speakers',
        subCategory: 'photo',
        domainId: $domain->id,
        createdByUserId: $user->id,
    );

    expect($item)->toBeInstanceOf(MediaItem::class)
        ->and($item->domain_id)->toBe($domain->id)
        ->and($item->category->value)->toBe('speakers')
        ->and($item->sub_category)->toBe('photo')
        ->and($item->created_by_user_id)->toBe($user->id)
        ->and($item->file_name)->toBe('hero.webp')
        ->and($item->path)->toStartWith('speakers/'.$item->id.'/')
        ->and($item->path)->toEndWith('/hero.webp')
        ->and($item->mime_type)->toBe('image/webp')
        ->and($item->size)->toBeGreaterThan(0);

    Storage::disk('public')->assertExists($item->path);
});

it('falls back to the authenticated user and null domain when not supplied', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $upload = UploadedFile::fake()->image('logo.png');

    $item = app(MediaItemCreator::class)->fromUpload(
        source: $upload,
        category: 'brand',
    );

    expect($item->created_by_user_id)->toBe($user->id)
        ->and($item->domain_id)->toBeNull()
        ->and($item->sub_category)->toBeNull();
});
