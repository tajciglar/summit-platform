<?php

namespace Database\Factories;

use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Summit>
 */
class SummitFactory extends Factory
{
    protected $model = Summit::class;

    public function definition(): array
    {
        $title = fake()->unique()->catchPhrase().' Summit';

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1000, 9999),
            'title' => $title,
            'description' => fake()->paragraph(),
            'topic' => fake()->word(),
            'status' => 'published',
            'current_phase' => 'pre',
            'timezone' => 'America/New_York',
            'pre_summit_starts_at' => now()->subDays(30),
            'late_pre_summit_starts_at' => now()->subDays(7),
            'during_summit_starts_at' => now()->addDays(7),
            'post_summit_starts_at' => now()->addDays(14),
            'ends_at' => now()->addDays(30),
        ];
    }
}
