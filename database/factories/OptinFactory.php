<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\Optin;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;

class OptinFactory extends Factory
{
    protected $model = Optin::class;

    public function definition(): array
    {
        return [
            'funnel_id' => Funnel::factory(),
            'summit_id' => Summit::factory(),
            'email' => $this->faker->unique()->safeEmail(),
            'first_name' => $this->faker->firstName(),
        ];
    }
}
