<?php

use App\Services\Blocks\BlockCatalogService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
});

it('fetches catalog from bunny and caches it', function () {
    config(['block_catalog.bunny_hostname' => 'cdn.example.com']);
    config(['block_catalog.catalog_path' => 'block-catalog/current.json']);

    Http::fake([
        'https://cdn.example.com/block-catalog/current.json' => Http::response([
            'version' => '2026-04-13-1',
            'blocks' => [
                ['type' => 'HeroMinimal', 'category' => 'hero', 'version' => 1],
            ],
        ]),
    ]);

    $service = app(BlockCatalogService::class);
    $catalog = $service->fetchAndCache();

    expect($catalog['version'])->toBe('2026-04-13-1');
    expect(Cache::has(config('block_catalog.cache_key')))->toBeTrue();
});

it('returns cached catalog when present', function () {
    $cached = ['version' => 'cached', 'blocks' => []];
    Cache::put(config('block_catalog.cache_key'), $cached);

    $service = app(BlockCatalogService::class);
    expect($service->current())->toBe($cached);
});
