<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\FunnelStep;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FunnelStep>
 */
class FunnelStepFactory extends Factory
{
    protected $model = FunnelStep::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['optin', 'sales_page', 'checkout', 'upsell', 'thank_you']);

        return [
            'funnel_id' => Funnel::factory(),
            'step_type' => $type,
            'slug' => Str::slug($type).'-'.fake()->unique()->numberBetween(100, 999),
            'name' => Str::headline($type),
            'page_content' => [],
            'sort_order' => 0,
            'is_published' => true,
        ];
    }
}
