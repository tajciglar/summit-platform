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
