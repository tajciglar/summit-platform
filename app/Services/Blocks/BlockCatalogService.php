<?php

namespace App\Services\Blocks;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class BlockCatalogService
{
    public function current(): array
    {
        return Cache::remember(
            config('block_catalog.cache_key'),
            now()->addHour(),
            fn () => $this->fetchAndCache()
        );
    }

    public function fetchAndCache(): array
    {
        $hostname = config('block_catalog.bunny_hostname');
        $path = config('block_catalog.catalog_path');

        // Dev fallback: if no Bunny hostname is configured, try the local Next.js public catalog.
        if (empty($hostname)) {
            $nextUrl = rtrim((string) config('next.url'), '/');
            if ($nextUrl === '') {
                throw new RuntimeException(
                    'Block catalog not configured: set BUNNY_CDN_HOSTNAME (prod) or NEXT_APP_URL (dev).'
                );
            }
            $devUrl = "{$nextUrl}/block-catalog.json";
            $response = Http::timeout(10)->get($devUrl);
            if (! $response->ok()) {
                throw new RuntimeException("Failed to fetch local catalog at {$devUrl}: {$response->status()}");
            }
            $catalog = $response->json();
            Cache::put(config('block_catalog.cache_key'), $catalog, now()->addHour());

            return $catalog;
        }

        $url = "https://{$hostname}/{$path}";
        $response = Http::timeout(10)->get($url);

        if (! $response->ok()) {
            throw new RuntimeException("Failed to fetch catalog: {$response->status()}");
        }

        $catalog = $response->json();
        Cache::put(config('block_catalog.cache_key'), $catalog, now()->addHour());

        return $catalog;
    }

    public function findBlock(string $type, int $version): ?array
    {
        foreach ($this->current()['blocks'] ?? [] as $block) {
            if ($block['type'] === $type && $block['version'] === $version) {
                return $block;
            }
        }

        return null;
    }

    public function blocksForStep(string $stepType): array
    {
        return array_values(array_filter(
            $this->current()['blocks'] ?? [],
            fn ($b) => in_array($stepType, $b['validOn'] ?? [], true)
        ));
    }
}
