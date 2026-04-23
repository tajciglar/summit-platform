<?php

use App\Enums\MediaCategory;
use App\Models\MediaItem;
use App\Support\Media\MediaItemPathGenerator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

beforeEach(function () {
    $this->generator = new MediaItemPathGenerator;
});

it('places items under category/media-item-uuid (domain id omitted)', function () {
    $item = new MediaItem(['domain_id' => '11111111-1111-1111-1111-111111111111', 'category' => MediaCategory::LandingPage]);
    $item->id = '22222222-2222-2222-2222-222222222222';
    $media = new Media(['id' => 1]);
    $media->setRelation('model', $item);

    expect($this->generator->getPath($media))
        ->toBe('landing_page/22222222-2222-2222-2222-222222222222/');
});

it('places items without a domain under the same category path', function () {
    $item = new MediaItem(['domain_id' => null, 'category' => MediaCategory::Brand]);
    $item->id = '33333333-3333-3333-3333-333333333333';
    $media = new Media(['id' => 2]);
    $media->setRelation('model', $item);

    expect($this->generator->getPath($media))
        ->toBe('brand/33333333-3333-3333-3333-333333333333/');
});

it('places conversions in a sibling folder', function () {
    $item = new MediaItem(['domain_id' => null, 'category' => MediaCategory::LandingPage]);
    $item->id = '44444444-4444-4444-4444-444444444444';
    $media = new Media(['id' => 3]);
    $media->setRelation('model', $item);

    expect($this->generator->getPathForConversions($media))
        ->toBe('landing_page/44444444-4444-4444-4444-444444444444/conversions/');
});
