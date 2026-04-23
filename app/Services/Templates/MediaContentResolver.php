<?php

namespace App\Services\Templates;

use App\Models\MediaItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Walk a content tree and, for every `*MediaId` / `*ImageId` field that
 * resolves to a MediaItem, add a sibling object with the resolved URL and
 * display metadata. Key convention:
 *   backgroundImageId -> backgroundImage
 *   logoMediaId       -> logo
 *   thumbnailMediaId  -> thumbnail
 *
 * Null / missing / unresolved ids are skipped — the skin sees nothing and
 * should render its empty-state layout.
 */
class MediaContentResolver
{
    /**
     * @param  array<int|string, mixed>  $content
     * @return array<int|string, mixed>
     */
    public function resolve(array $content): array
    {
        $ids = $this->collectIds($content);

        if ($ids === []) {
            return $content;
        }

        /** @var Collection<string, MediaItem> $items */
        $items = MediaItem::query()->whereIn('id', $ids)->get()->keyBy('id');

        return $this->walk($content, $items);
    }

    /**
     * @param  array<int|string, mixed>  $node
     * @return list<string>
     */
    private function collectIds(array $node): array
    {
        $out = [];
        $this->collectIdsRecursive($node, $out);

        return array_values(array_unique($out));
    }

    /**
     * @param  array<int|string, mixed>  $node
     * @param  list<string>  $out
     */
    private function collectIdsRecursive(array $node, array &$out): void
    {
        foreach ($node as $key => $value) {
            if (is_array($value)) {
                $this->collectIdsRecursive($value, $out);

                continue;
            }
            if (is_string($key) && $this->isMediaIdKey($key) && is_string($value) && $value !== '') {
                $out[] = $value;
            }
        }
    }

    /**
     * @param  array<int|string, mixed>  $node
     * @param  Collection<string, MediaItem>  $items
     * @return array<int|string, mixed>
     */
    private function walk(array $node, Collection $items): array
    {
        $out = [];

        foreach ($node as $key => $value) {
            if (is_array($value)) {
                $out[$key] = $this->walk($value, $items);

                continue;
            }

            $out[$key] = $value;

            if (is_string($key) && $this->isMediaIdKey($key) && is_string($value) && $value !== '') {
                $item = $items->get($value);
                if ($item instanceof MediaItem) {
                    $out[$this->sidecarKey($key)] = $this->toSidecar($item);
                }
            }
        }

        return $out;
    }

    private function isMediaIdKey(string $key): bool
    {
        return Str::endsWith($key, ['MediaId', 'ImageId']);
    }

    private function sidecarKey(string $key): string
    {
        if (Str::endsWith($key, 'MediaId')) {
            return Str::replaceLast('MediaId', '', $key);
        }

        return Str::replaceLast('ImageId', 'Image', $key);
    }

    /**
     * @return array{id: string, url: ?string, alt: ?string, width: ?int, height: ?int}
     */
    private function toSidecar(MediaItem $item): array
    {
        return [
            'id' => $item->getKey(),
            'url' => $item->url(),
            'alt' => $item->alt_text,
            'width' => $item->width,
            'height' => $item->height,
        ];
    }
}
