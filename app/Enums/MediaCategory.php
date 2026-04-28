<?php

namespace App\Enums;

enum MediaCategory: string
{
    case LandingPage = 'landing_page';
    case Product = 'product';
    case Speakers = 'speakers';
    case Brand = 'brand';
    case Downloadable = 'downloadable';

    public function label(): string
    {
        return match ($this) {
            self::LandingPage => 'Landing page',
            self::Product => 'Product',
            self::Speakers => 'Speakers',
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

    /**
     * Fixed vocabulary of sub-categories per top-level category. The picker and
     * the list page filter on these; operators can't type arbitrary values.
     *
     * @return array<string, string>
     */
    public function subCategoryOptions(): array
    {
        return match ($this) {
            self::LandingPage => [
                'pages' => 'Pages',
            ],
            self::Product => [
                'product' => 'Product image',
                'bump' => 'Order bump',
                'upsell' => 'Upsell',
                'downsell' => 'Downsell',
            ],
            self::Speakers => [
                'headshot' => 'Headshot',
                'author' => 'Author portrait',
            ],
            self::Brand => [
                'logo' => 'Logo',
                'favicon' => 'Favicon',
                'og_image' => 'OG image',
            ],
            self::Downloadable => [
                'ebook' => 'E-book',
                'worksheet' => 'Worksheet',
                'audio' => 'Audio',
                'pdf' => 'PDF',
            ],
        };
    }
}
