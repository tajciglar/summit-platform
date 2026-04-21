<?php

use App\Filament\Forms\Components\MediaPickerInput;
use App\Models\MediaItem;
use App\Models\Product;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('exposes role and category getters after configuration', function (): void {
    $field = MediaPickerInput::make('hero_media_item_id')
        ->role('hero')
        ->category('speaker');

    expect($field->getRole())->toBe('hero')
        ->and($field->getCategory())->toBe('speaker');
});

it('defaults role to image and category to product', function (): void {
    $field = MediaPickerInput::make('image_media_item_id');

    expect($field->getRole())->toBe('image')
        ->and($field->getCategory())->toBe('product');
});

it('hydrates state from an existing pivot attachment', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create(['summit_id' => $summit->id]);
    $item = MediaItem::factory()->create();
    $product->setMediaFor('image', $item);

    expect($product->fresh()->mediaFor('image')?->getKey())->toBe($item->getKey());
});

it('writes a pivot row via setMediaFor', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create(['summit_id' => $summit->id]);
    $item = MediaItem::factory()->create();

    $product->setMediaFor('image', $item);

    expect($product->fresh()->mediaFor('image')?->getKey())->toBe($item->getKey());
});

it('replaces the pivot row when a different item is set', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create(['summit_id' => $summit->id]);
    $first = MediaItem::factory()->create();
    $second = MediaItem::factory()->create();

    $product->setMediaFor('image', $first);
    $product->setMediaFor('image', $second);

    expect($product->fresh()->mediaFor('image')?->getKey())->toBe($second->getKey());
});

it('clears the pivot row when null is set', function (): void {
    $summit = Summit::factory()->create();
    $product = Product::factory()->create(['summit_id' => $summit->id]);
    $item = MediaItem::factory()->create();

    $product->setMediaFor('image', $item);
    $product->setMediaFor('image', null);

    expect($product->fresh()->mediaFor('image'))->toBeNull();
});
