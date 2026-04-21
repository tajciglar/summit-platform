<?php

namespace App\Models\Concerns;

use App\Models\MediaItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasMediaAttachments
{
    public function mediaAttachments(): MorphToMany
    {
        return $this->morphToMany(
            MediaItem::class,
            'attachable',
            'media_item_attachments'
        )->withPivot(['role', 'sort_order'])->withTimestamps();
    }

    public function mediaFor(string $role): ?MediaItem
    {
        return $this->mediaAttachments()
            ->wherePivot('role', $role)
            ->orderBy('media_item_attachments.sort_order')
            ->first();
    }

    public function galleryFor(string $role): Collection
    {
        return $this->mediaAttachments()
            ->wherePivot('role', $role)
            ->orderBy('media_item_attachments.sort_order')
            ->get();
    }

    public function setMediaFor(string $role, ?MediaItem $item): void
    {
        $this->mediaAttachments()->wherePivot('role', $role)->detach();
        if ($item !== null) {
            $this->mediaAttachments()->attach($item->getKey(), ['role' => $role, 'sort_order' => 0]);
        }
    }

    /**
     * @param  array<int, string>  $mediaItemIds
     */
    public function setGalleryFor(string $role, array $mediaItemIds): void
    {
        $this->mediaAttachments()->wherePivot('role', $role)->detach();
        foreach (array_values($mediaItemIds) as $index => $id) {
            $this->mediaAttachments()->attach($id, ['role' => $role, 'sort_order' => $index]);
        }
    }
}
