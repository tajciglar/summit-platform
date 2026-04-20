<?php

namespace App\Jobs;

use App\Models\LandingPageBatch;
use App\Services\Templates\TemplateSelector;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateLandingPageBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;

    public function __construct(public string $batchId) {}

    public function handle(TemplateSelector $selector): void
    {
        $batch = LandingPageBatch::findOrFail($this->batchId);

        $countsMap = $batch->versions_per_template;

        if (! empty($countsMap)) {
            // New path: per-template counts supplied by the Generate variants modal.
            // Version numbers are assigned sequentially across all templates so they
            // remain unique within a batch (matching the unique constraint on
            // landing_page_drafts.version_number + batch_id).
            $batch->update(['status' => 'running']);

            $versionNumber = 1;
            foreach ($countsMap as $templateKey => $n) {
                for ($i = 0; $i < (int) $n; $i++) {
                    GenerateLandingPageVersionJob::dispatch($batch->id, (string) $templateKey, $versionNumber);
                    $versionNumber++;
                }
            }

            return;
        }

        // Legacy path: template_pool × version_count (existing behaviour).
        $pool = (array) ($batch->template_pool ?? []);

        $keys = $selector->pick($pool, $batch->version_count);
        if (empty($keys)) {
            $batch->update(['status' => 'failed']);

            return;
        }

        $batch->update(['status' => 'running']);

        foreach ($keys as $i => $key) {
            GenerateLandingPageVersionJob::dispatch($batch->id, $key, $i + 1);
        }
    }
}
