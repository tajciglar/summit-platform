<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Funnel>
 */
class FunnelFactory extends Factory
{
    protected $model = Funnel::class;

    public function definition(): array
    {
        $name = fake()->words(2, true).' Funnel';

        return [
            'summit_id' => Summit::factory(),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'name' => $name,
            'description' => fake()->sentence(),
            'target_phase' => fake()->randomElement(['pre', 'late_pre', 'during', 'post', null]),
            'wp_checkout_redirect_url' => 'https://wp.example.com/checkout',
            'wp_thankyou_redirect_url' => 'https://wp.example.com/thank-you',
            'is_active' => true,
        ];
    }
}
