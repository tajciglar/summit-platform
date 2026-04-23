<?php

namespace App\Jobs;

use App\Models\MediaItem;
use App\Services\Media\WebpConverter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Re-encodes a freshly uploaded MediaItem to WebP after the original bytes
 * have already landed on the configured disk. The conversion happens in
 * the queue so uploads return immediately — the window where the URL still
 * points to the original is usually <30s on Bunny.
 */
class ConvertMediaItemToWebp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public string $mediaItemId) {}

    public function handle(WebpConverter $converter): void
    {
        $item = MediaItem::find($this->mediaItemId);
        if ($item === null || $item->mime_type === 'image/webp') {
            return;
        }

        $media = $item->getFirstMedia('file');
        if ($media === null) {
            return;
        }

        $tempSource = tempnam(sys_get_temp_dir(), 'webp_src_');
        file_put_contents($tempSource, Storage::disk($media->disk)->get($media->getPathRelativeToRoot()));

        $converted = $converter->convert($tempSource, $media->file_name, $media->mime_type);
        @unlink($tempSource);

        if ($converted === null) {
            return;
        }

        $item->clearMediaCollection('file');
        $newMedia = $item
            ->addMedia($converted['path'])
            ->usingName(pathinfo($converted['fileName'], PATHINFO_FILENAME))
            ->usingFileName($converted['fileName'])
            ->toMediaCollection('file');

        $item->update([
            'disk' => $newMedia->disk,
            'path' => $newMedia->getPathRelativeToRoot(),
            'file_name' => $newMedia->file_name,
            'size' => $newMedia->size,
            'mime_type' => $newMedia->mime_type,
        ]);
    }

    public function failed(\Throwable $e): void
    {
        Log::warning('WebP conversion job failed; keeping original', [
            'media_item_id' => $this->mediaItemId,
            'error' => $e->getMessage(),
        ]);
    }
}
