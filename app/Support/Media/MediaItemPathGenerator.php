<?php

namespace App\Support\Media;

use App\Models\MediaItem;
use BackedEnum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

class MediaItemPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        return $this->basePath($media).'/';
    }

    public function getPathForConversions(Media $media): string
    {
        return $this->basePath($media).'/conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->basePath($media).'/responsive/';
    }

    private function basePath(Media $media): string
    {
        /** @var MediaItem $item */
        $item = $media->model;
        $prefix = $item->domain_id ?: '_global';
        $category = $item->category instanceof BackedEnum
            ? $item->category->value
            : (string) $item->category;

        return sprintf('%s/%s/%s', $prefix, $category, $item->id);
    }
}
