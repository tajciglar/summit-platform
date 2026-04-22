<?php

use App\Enums\MediaCategory;

it('has five categories', function () {
    expect(MediaCategory::cases())->toHaveCount(5);
});

it('has expected values', function () {
    expect(collect(MediaCategory::cases())->pluck('value')->all())
        ->toEqual(['hero', 'product', 'people', 'brand', 'downloadable']);
});

it('returns a human label', function () {
    expect(MediaCategory::Hero->label())->toBe('Hero');
    expect(MediaCategory::People->label())->toBe('People');
});
