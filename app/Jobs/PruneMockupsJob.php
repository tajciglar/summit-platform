<?php

namespace App\Jobs;

use App\Models\LandingPageDraft;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PruneMockupsJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $cutoff = Carbon::now()->subDays(7);
        $pruned = 0;

        LandingPageDraft::query()
            ->where('status', 'rejected')
            ->where('updated_at', '<', $cutoff)
            ->select(['id'])
            ->chunkById(100, function ($drafts) use (&$pruned) {
                foreach ($drafts as $draft) {
                    $dir = "draft-mockups/{$draft->id}";
                    if (Storage::disk('public')->exists($dir)) {
                        Storage::disk('public')->deleteDirectory($dir);
                        $pruned++;
                    }
                }
            });

        if ($pruned > 0) {
            Log::info("PruneMockupsJob: removed mockup directories for {$pruned} rejected draft(s).");
        }
    }
}
