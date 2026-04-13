<?php

namespace Database\Factories;

use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitSpeaker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SummitSpeaker>
 */
class SummitSpeakerFactory extends Factory
{
    protected $model = SummitSpeaker::class;

    public function definition(): array
    {
        return [
            'summit_id' => Summit::factory(),
            'speaker_id' => Speaker::factory(),
            'masterclass_title' => fake()->sentence(5),
            'masterclass_description' => fake()->paragraph(),
            'sort_order' => 0,
            'is_featured' => false,
            'free_access_window_hours' => 24,
        ];
    }
}
