<?php

use App\Enums\MediaCategory;

it('has five categories', function () {
    expect(MediaCategory::cases())->toHaveCount(5);
});

it('has expected values', function () {
    expect(collect(MediaCategory::cases())->pluck('value')->all())
        ->toEqual(['landing_page', 'product', 'speakers', 'brand', 'downloadable']);
});

it('returns a human label', function () {
    expect(MediaCategory::LandingPage->label())->toBe('Landing page');
    expect(MediaCategory::Speakers->label())->toBe('Speakers');
});

it('exposes fixed sub-category vocabulary per category', function () {
    expect(MediaCategory::LandingPage->subCategoryOptions())
        ->toHaveKeys(['hero', 'side', 'section', 'press_logo']);
    expect(MediaCategory::Product->subCategoryOptions())
        ->toHaveKeys(['product', 'bump', 'upsell', 'downsell']);
    expect(MediaCategory::Speakers->subCategoryOptions())
        ->toHaveKeys(['headshot']);
    expect(MediaCategory::Brand->subCategoryOptions())
        ->toHaveKeys(['logo', 'favicon']);
    expect(MediaCategory::Downloadable->subCategoryOptions())
        ->toHaveKeys(['ebook', 'pdf']);
});
