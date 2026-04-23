<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->words(3, true).' Pass';

        return [
            'category' => 'vip_pass',
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'name' => $name,
            'description' => fake()->paragraph(),
            'product_type' => 'one_time',
            'tier' => 'vip',
            'grants_vip_access' => true,
            'is_active' => true,
            'price_pre_summit_cents' => 9700,
            'price_late_pre_cents' => 14700,
            'price_during_cents' => 19700,
            'price_post_summit_cents' => 24700,
            'compare_pre_summit_cents' => 29700,
            'compare_late_pre_cents' => 29700,
            'compare_during_cents' => 29700,
            'compare_post_summit_cents' => 29700,
        ];
    }
}
