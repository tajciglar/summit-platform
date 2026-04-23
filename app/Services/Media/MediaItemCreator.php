<?php

namespace App\Services\Media;

use App\Jobs\ConvertMediaItemToWebp;
use App\Models\MediaItem;
use Filament\Facades\Filament;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Creates a MediaItem from an uploaded file and pushes the bytes to the
 * configured disk (Bunny in production, `public` locally) via Spatie.
 *
 * Shared by the standalone Media Library create page and the inline
 * upload path on MediaPickerInput so both routes produce identical rows.
 */
class MediaItemCreator
{
    /**
     * @param  UploadedFile|string  $source  An uploaded file (Livewire's
     *                                       TemporaryUploadedFile extends
     *                                       UploadedFile), or a path on the
     *                                       `local` disk.
     */
    public function fromUpload(
        UploadedFile|string $source,
        string $category,
        ?string $subCategory = null,
        ?string $domainId = null,
        ?string $createdByUserId = null,
        ?string $caption = null,
        ?string $altText = null,
    ): MediaItem {
        [$realPath, $clientName, $mimeType] = $this->resolveSource($source);

        $item = DB::transaction(function () use ($realPath, $clientName, $category, $subCategory, $domainId, $createdByUserId, $caption, $altText) {
            $item = MediaItem::create([
                'domain_id' => $domainId ?? Filament::getTenant()?->getKey(),
                'category' => $category,
                'sub_category' => $subCategory,
                'created_by_user_id' => $createdByUserId ?? auth()->id(),
                'caption' => $caption,
                'alt_text' => $altText,
                'path' => '',
                'file_name' => '',
                'size' => 0,
            ]);

            $media = $item
                ->addMedia($realPath)
                ->usingName(pathinfo($clientName, PATHINFO_FILENAME))
                ->usingFileName($clientName)
                ->toMediaCollection('file');

            $item->update([
                'disk' => $media->disk,
                'path' => $media->getPathRelativeToRoot(),
                'file_name' => $media->file_name,
                'size' => $media->size,
                'mime_type' => $media->mime_type,
            ]);

            return $item->fresh();
        });

        // WebP conversion is queued so uploads return immediately. The job
        // re-encodes and swaps the Spatie media once it runs.
        if (WebpConverter::isConvertibleMime($mimeType)) {
            ConvertMediaItemToWebp::dispatch($item->id);
        }

        return $item;
    }

    /**
     * @return array{0: string, 1: string, 2: string} [realPath, clientOriginalName, mimeType]
     */
    private function resolveSource(UploadedFile|string $source): array
    {
        if ($source instanceof UploadedFile) {
            return [
                $source->getRealPath(),
                $source->getClientOriginalName(),
                $source->getMimeType() ?? 'application/octet-stream',
            ];
        }

        $path = Storage::disk('local')->path($source);

        return [
            $path,
            basename($source),
            mime_content_type($path) ?: 'application/octet-stream',
        ];
    }
}
