<?php

namespace Database\Factories;

use App\Models\FunnelStep;
use App\Models\FunnelStepRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FunnelStepRevision>
 */
class FunnelStepRevisionFactory extends Factory
{
    protected $model = FunnelStepRevision::class;

    public function definition(): array
    {
        return [
            'funnel_step_id' => FunnelStep::factory(),
            'page_content_snapshot' => ['blocks' => []],
            'published_at' => now(),
            'published_by' => User::factory(),
        ];
    }
}
