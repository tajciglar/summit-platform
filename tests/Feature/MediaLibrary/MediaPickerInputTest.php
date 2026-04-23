<?php

use App\Filament\Forms\Components\MediaPickerInput;
use App\Models\MediaItem;
use App\Models\Product;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('exposes role and category getters after configuration', function (): void {
    $field = MediaPickerInput::make('photo_media_item_id')
        ->role('photo')
        ->category('speakers');

    expect($field->getRole())->toBe('photo')
        ->and($field->getCategory())->toBe('speakers');
});

it('defaults role to image and category to product', function (): void {
    $field = MediaPickerInput::make('image_media_item_id');

    expect($field->getRole())->toBe('image')
        ->and($field->getCategory())->toBe('product');
});

it('allows inline upload by default and respects allowUpload(false)', function (): void {
    $withUpload = MediaPickerInput::make('a');
    $libraryOnly = MediaPickerInput::make('b')->allowUpload(false);

    expect($withUpload->isUploadAllowed())->toBeTrue()
        ->and($libraryOnly->isUploadAllowed())->toBeFalse();
});

it('builds an upload state path alongside the main state path', function (): void {
    $field = MediaPickerInput::make('image_media_item_id');

    expect($field->getUploadStatePath(false))->toBe('image_media_item_id_upload');
});

it('hydrates state from an existing pivot attachment', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create();
    $product->summits()->attach($summit->id);
    $item = MediaItem::factory()->create();
    $product->setMediaFor('image', $item);

    expect($product->fresh()->mediaFor('image')?->getKey())->toBe($item->getKey());
});

it('writes a pivot row via setMediaFor', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create();
    $product->summits()->attach($summit->id);
    $item = MediaItem::factory()->create();

    $product->setMediaFor('image', $item);

    expect($product->fresh()->mediaFor('image')?->getKey())->toBe($item->getKey());
});

it('replaces the pivot row when a different item is set', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create();
    $product->summits()->attach($summit->id);
    $first = MediaItem::factory()->create();
    $second = MediaItem::factory()->create();

    $product->setMediaFor('image', $first);
    $product->setMediaFor('image', $second);

    expect($product->fresh()->mediaFor('image')?->getKey())->toBe($second->getKey());
});

it('clears the pivot row when null is set', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create();
    $product->summits()->attach($summit->id);
    $item = MediaItem::factory()->create();

    $product->setMediaFor('image', $item);
    $product->setMediaFor('image', null);

    expect($product->fresh()->mediaFor('image'))->toBeNull();
});
