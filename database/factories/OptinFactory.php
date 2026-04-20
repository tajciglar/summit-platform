<?php

namespace Database\Factories;

use App\Models\Optin;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Optin>
 */
class OptinFactory extends Factory
{
    protected $model = Optin::class;

    public function definition(): array
    {
        return [
            'email' => fake()->safeEmail(),
            'first_name' => fake()->firstName(),
            'activecampaign_synced' => false,
        ];
    }
}
