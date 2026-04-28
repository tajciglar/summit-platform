<?php

namespace Database\Factories;

use App\Enums\MediaCategory;
use App\Models\MediaItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaItem>
 */
class MediaItemFactory extends Factory
{
    protected $model = MediaItem::class;

    public function definition(): array
    {
        return [
            'category' => MediaCategory::LandingPage,
            'sub_category' => 'pages',
            'disk' => 'bunny',
            'path' => "media/{$this->faker->uuid()}.png",
            'file_name' => "{$this->faker->word()}.png",
            'mime_type' => 'image/png',
            'size' => 1024,
            'width' => null,
            'height' => null,
            'caption' => $this->faker->sentence(3),
            'alt_text' => $this->faker->sentence(5),
            'created_by_user_id' => null,
            'legacy_spatie_media_id' => null,
        ];
    }
}
