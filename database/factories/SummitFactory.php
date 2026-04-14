<?php

namespace Database\Factories;

use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Summit>
 */
class SummitFactory extends Factory
{
    protected $model = Summit::class;

    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'topic' => fake()->words(2, true),
            'status' => 'draft',
            'current_phase' => 'pre_summit',
            'timezone' => 'America/New_York',
            'starts_at' => now()->addDays(30),
            'ends_at' => now()->addDays(33),
        ];
    }
}
