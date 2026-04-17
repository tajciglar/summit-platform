<?php

declare(strict_types=1);

namespace App\Services\Templates;

use App\Enums\SummitAudience;

class AudiencePalettes
{
    /**
     * Neutral fallback — matches opus-v1's current warm editorial look.
     * Used when a summit has no audience assigned.
     */
    public const NEUTRAL = [
        'primary' => '#C9812A',           // ochre
        'primary-contrast' => '#F5F1EA',  // paper-50
        'ink' => '#2A0F17',               // ink-900
        'paper' => '#F5F1EA',             // paper-50
        'paper-alt' => '#EDE7DD',         // paper-100
        'muted' => '#6B5B4E',             // taupe-600
        'accent' => '#D9963F',            // ochre-400
        'border' => '#DDD2C3',            // paper-300
    ];

    /**
     * @var array<string, array<string, string>> keyed by SummitAudience::value
     */
    public const PALETTES = [
        'adhd-parenting' => [
            'primary' => '#8B5CF6',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#1A1625',
            'paper' => '#FAF7FF',
            'paper-alt' => '#F3EDFF',
            'muted' => '#6B5B8A',
            'accent' => '#C4B5FD',
            'border' => '#E0D4FF',
        ],
        'adhd-women' => [
            'primary' => '#B1344A',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#18161A',
            'paper' => '#FAF8F4',
            'paper-alt' => '#F5F1EA',
            'muted' => '#6B5B55',
            'accent' => '#E8A4B3',
            'border' => '#E8DDD2',
        ],
        'adhd-men' => [
            'primary' => '#1E3A8A',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#14120F',
            'paper' => '#ECE7DB',
            'paper-alt' => '#D9D1BD',
            'muted' => '#A69A82',
            'accent' => '#3B82F6',
            'border' => '#38332B',
        ],
        'adhd-general' => [
            'primary' => '#2563EB',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#0F172A',
            'paper' => '#F5F1EA',
            'paper-alt' => '#E8E2D5',
            'muted' => '#64748B',
            'accent' => '#60A5FA',
            'border' => '#D4CDB8',
        ],
        'ai' => [
            'primary' => '#0A0A0A',
            'primary-contrast' => '#F2EFE9',
            'ink' => '#0A0A0A',
            'paper' => '#F2EFE9',
            'paper-alt' => '#E5E1D7',
            'muted' => '#737373',
            'accent' => '#F2C14B',
            'border' => '#D4CFC2',
        ],
        'menopause' => [
            'primary' => '#D9436A',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#2A1622',
            'paper' => '#FBF0F3',
            'paper-alt' => '#F5E0E8',
            'muted' => '#8A6570',
            'accent' => '#F8B4C3',
            'border' => '#EAC9D4',
        ],
        'herbal' => [
            'primary' => '#6B8E5A',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#1F2817',
            'paper' => '#F5F1E8',
            'paper-alt' => '#EAE4D3',
            'muted' => '#6B7A5A',
            'accent' => '#A4C48A',
            'border' => '#D4CDB8',
        ],
        'women-longevity' => [
            'primary' => '#5E8E72',
            'primary-contrast' => '#FFFFFF',
            'ink' => '#1F2923',
            'paper' => '#F4EFE4',
            'paper-alt' => '#E7E0CF',
            'muted' => '#6F7A6E',
            'accent' => '#A4C6B1',
            'border' => '#D4CDB8',
        ],
    ];

    /**
     * Returns the resolved palette hex map for the given audience.
     * Null returns NEUTRAL.
     *
     * @return array<string, string>
     */
    public static function paletteFor(?SummitAudience $audience): array
    {
        if ($audience === null) {
            return self::NEUTRAL;
        }

        return self::PALETTES[$audience->value] ?? self::NEUTRAL;
    }
}
