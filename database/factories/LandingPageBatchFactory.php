<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LandingPageBatch>
 */
class LandingPageBatchFactory extends Factory
{
    protected $model = LandingPageBatch::class;

    public function definition(): array
    {
        return [
            'summit_id' => Summit::factory(),
            'funnel_id' => Funnel::factory(),
            'version_count' => 3,
            'status' => 'queued',
        ];
    }
}
