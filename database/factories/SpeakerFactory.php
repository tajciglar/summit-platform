<?php

namespace Database\Factories;

use App\Models\Speaker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Speaker>
 */
class SpeakerFactory extends Factory
{
    protected $model = Speaker::class;

    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'photo_url' => fake()->imageUrl(200, 200, 'people'),
            'title' => fake()->jobTitle(),
            'short_description' => fake()->sentence(),
            'long_description' => fake()->paragraph(),
            'website_url' => fake()->url(),
            'social_links' => [],
        ];
    }
}
