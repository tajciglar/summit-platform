<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Normalizes uploaded filenames into human-readable titles.
 *
 *   `my-photo_v2.JPG` → `My Photo V2`
 */
class MediaTitle
{
    public static function fromFilename(string $filename): string
    {
        $base = pathinfo($filename, PATHINFO_FILENAME);
        $spaced = str_replace(['-', '_'], ' ', $base);
        $collapsed = preg_replace('/\s+/', ' ', $spaced) ?? $spaced;

        return Str::title(trim($collapsed));
    }
}
