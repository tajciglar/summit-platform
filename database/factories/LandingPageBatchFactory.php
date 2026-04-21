<?php

namespace Database\Factories;

use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Models\User;
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
            'funnel_step_id' => null,
            'version_count' => 3,
            'status' => 'queued',
            'notes' => null,
            'style_reference_url' => null,
            'override_url' => null,
            'allowed_types' => [],
            'template_pool' => [],
            'completed_at' => null,
        ];
    }

    public function running(): static
    {
        return $this->state(fn () => ['status' => 'running']);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function autoPublish(?User $user = null): static
    {
        return $this->state(fn () => [
            'auto_publish' => true,
            'published_by_user_id' => $user?->id ?? User::factory(),
        ]);
    }
}
