<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Funnel>
 */
class FunnelFactory extends Factory
{
    protected $model = Funnel::class;

    public function definition(): array
    {
        return [
            'summit_id' => Summit::factory(),
            'slug' => fake()->unique()->slug(2),
            'name' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'is_active' => true,
            'theme' => [],
        ];
    }
}
