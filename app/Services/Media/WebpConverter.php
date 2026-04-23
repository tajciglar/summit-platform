<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Log;

/**
 * Converts uploaded raster images to WebP via Imagick.
 *
 * Skipped formats:
 *  - `image/webp` — already optimal
 *  - `image/svg+xml` — vector; WebP would lose fidelity
 *  - `image/gif` — often animated; WebP animation support is uneven
 *  - non-image mimes (PDFs, audio, etc.)
 *
 * HEIC/HEIF (iPhone photos) are handled natively by Imagick when libheif
 * is compiled in, which is the case on macOS Herd/Homebrew PHP.
 */
class WebpConverter
{
    private const SKIP_MIMES = ['image/webp', 'image/svg+xml', 'image/gif'];

    private const QUALITY = 82;

    /**
     * Convert the file at `$sourcePath` to WebP.
     *
     * @return array{path: string, fileName: string, mimeType: string}|null
     *                                                                      `null` when the source is skipped (non-image, already WebP,
     *                                                                      GIF, SVG) or when conversion fails — callers should fall
     *                                                                      back to storing the original bytes.
     */
    public function convert(string $sourcePath, string $originalFileName, string $mimeType): ?array
    {
        if (! str_starts_with($mimeType, 'image/') || in_array($mimeType, self::SKIP_MIMES, true)) {
            return null;
        }

        if (! extension_loaded('imagick')) {
            return null;
        }

        try {
            $image = new \Imagick($sourcePath);

            // Flatten against white for formats that carry transparency data
            // the WebP encoder would otherwise misinterpret (PSD, some PNGs).
            if ($image->getImageAlphaChannel()) {
                $image->setImageBackgroundColor('white');
            }

            $image->setImageFormat('webp');
            $image->setImageCompressionQuality(self::QUALITY);
            $image->stripImage();

            $baseName = pathinfo($originalFileName, PATHINFO_FILENAME) ?: 'image';
            $newFileName = $baseName.'.webp';
            $tempPath = tempnam(sys_get_temp_dir(), 'webp_').'.webp';
            $image->writeImage($tempPath);
            $image->clear();
            $image->destroy();

            return [
                'path' => $tempPath,
                'fileName' => $newFileName,
                'mimeType' => 'image/webp',
            ];
        } catch (\Throwable $e) {
            Log::warning('WebP conversion failed; keeping original', [
                'path' => $sourcePath,
                'mime' => $mimeType,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
