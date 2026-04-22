<?php

namespace App\Enums;

enum MediaCategory: string
{
    case Hero = 'hero';
    case Product = 'product';
    case People = 'people';
    case Brand = 'brand';
    case Downloadable = 'downloadable';

    public function label(): string
    {
        return match ($this) {
            self::Hero => 'Hero',
            self::Product => 'Product',
            self::People => 'People',
            self::Brand => 'Brand',
            self::Downloadable => 'Downloadable',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $c) => [$c->value => $c->label()])
            ->all();
    }
}
