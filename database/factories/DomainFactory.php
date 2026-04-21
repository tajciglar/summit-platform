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
        $name = $this->faker->unique()->word();

        return [
            'name' => $this->faker->company(),
            'hostname' => "{$name}.example.com",
            'slug' => Str::slug($name),
            'brand_color' => $this->faker->hexColor(),
            'is_active' => true,
        ];
    }
}
