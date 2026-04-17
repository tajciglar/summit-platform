<?php

namespace Database\Factories;

use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Speaker>
 */
class SpeakerFactory extends Factory
{
    protected $model = Speaker::class;

    public function definition(): array
    {
        $first = fake()->firstName();
        $last = fake()->lastName();

        return [
            'summit_id' => Summit::factory(),
            'slug' => Str::slug("{$first}-{$last}").'-'.fake()->unique()->numberBetween(100, 999),
            'first_name' => $first,
            'last_name' => $last,
            'email' => fake()->unique()->safeEmail(),
            'title' => fake()->jobTitle().' at '.fake()->company(),
            'short_bio' => fake()->sentence(20),
            'long_bio' => fake()->paragraphs(3, true),
            'social_links' => [
                'twitter' => 'https://twitter.com/'.fake()->userName(),
                'linkedin' => 'https://linkedin.com/in/'.fake()->userName(),
            ],
            'masterclass_title' => fake()->catchPhrase(),
            'masterclass_description' => fake()->paragraph(),
            'rating' => fake()->numberBetween(3, 5),
            'goes_live_at' => fake()->dateTimeBetween('-7 days', '+14 days'),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_featured' => fake()->boolean(25),
            'free_access_window_hours' => 24,
        ];
    }
}
