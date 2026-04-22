<?php

namespace Database\Factories;

use App\Models\Domain;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Domain>
 */
class DomainFactory extends Factory
{
    protected $model = Domain::class;

    public function definition(): array
    {
        $slug = Str::slug(fake()->unique()->domainWord()).'-'.fake()->unique()->numberBetween(1000, 9999);

        return [
            'name' => fake()->company(),
            'hostname' => "{$slug}.test",
            'slug' => $slug,
            'brand_color' => fake()->hexColor(),
            'is_active' => true,
        ];
    }
}
