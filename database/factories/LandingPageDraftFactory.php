<?php

namespace Database\Factories;

use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LandingPageDraft>
 */
class LandingPageDraftFactory extends Factory
{
    protected $model = LandingPageDraft::class;

    public function definition(): array
    {
        return [
            'batch_id' => LandingPageBatch::factory(),
            'version_number' => 1,
            'template_key' => 'opus-v1',
            'blocks' => null,
            'sections' => ['hero' => ['headline' => fake()->sentence()]],
            'enabled_sections' => null,
            'published_html' => null,
            'published_hydration_manifest' => null,
            'status' => 'pending',
            'preview_token' => Str::random(40),
            'error_message' => null,
            'token_count' => null,
            'generation_ms' => null,
        ];
    }

    public function ready(): static
    {
        return $this->state(fn () => ['status' => 'ready']);
    }

    public function shortlisted(): static
    {
        return $this->state(fn () => ['status' => 'shortlisted']);
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approved']);
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => 'published']);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'error_message' => 'Generation failed',
        ]);
    }
}
