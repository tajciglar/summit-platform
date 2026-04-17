<?php

declare(strict_types=1);

namespace App\Enums;

enum SummitAudience: string
{
    case AdhdParenting = 'adhd-parenting';
    case AdhdWomen = 'adhd-women';
    case AdhdMen = 'adhd-men';
    case AdhdGeneral = 'adhd-general';
    case Ai = 'ai';
    case Menopause = 'menopause';
    case Herbal = 'herbal';
    case WomenLongevity = 'women-longevity';

    public function label(): string
    {
        return match ($this) {
            self::AdhdParenting => 'ADHD — Parenting',
            self::AdhdWomen => 'ADHD — Women',
            self::AdhdMen => 'ADHD — Men',
            self::AdhdGeneral => 'ADHD — General',
            self::Ai => 'AI',
            self::Menopause => 'Menopause',
            self::Herbal => 'Herbal',
            self::WomenLongevity => 'Women Longevity',
        };
    }

    /** @return array<string, string> value → label for Filament Select options */
    public static function options(): array
    {
        $out = [];
        foreach (self::cases() as $c) {
            $out[$c->value] = $c->label();
        }

        return $out;
    }
}
