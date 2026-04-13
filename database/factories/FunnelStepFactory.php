<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\FunnelStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FunnelStep>
 */
class FunnelStepFactory extends Factory
{
    protected $model = FunnelStep::class;

    public function definition(): array
    {
        return [
            'funnel_id' => Funnel::factory(),
            'step_type' => 'optin',
            'template' => 'default',
            'slug' => fake()->unique()->slug(2),
            'name' => fake()->sentence(3),
            'content' => [],
            'sort_order' => 0,
            'is_published' => true,
        ];
    }
}
