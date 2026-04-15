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
            'blocks' => [],
            'status' => 'pending',
            'preview_token' => Str::random(64),
        ];
    }
}
