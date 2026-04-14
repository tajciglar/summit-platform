<?php

namespace App\Jobs;

use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class GenerateLandingPageBatchJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly LandingPageBatch $batch) {}

    public function handle(): void
    {
        $this->batch->update(['status' => 'running']);

        for ($i = 1; $i <= $this->batch->version_count; $i++) {
            $draft = LandingPageDraft::create([
                'batch_id'       => $this->batch->id,
                'version_number' => $i,
                'status'         => 'pending',
                'preview_token'  => Str::random(40),
            ]);

            dispatch(new GenerateLandingPageVersionJob($draft));
        }
    }
}
