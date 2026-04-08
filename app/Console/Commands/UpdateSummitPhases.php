<?php

namespace App\Console\Commands;

use App\Models\Summit;
use App\Models\SummitPhaseSchedule;
use Illuminate\Console\Command;

class UpdateSummitPhases extends Command
{
    protected $signature = 'summits:update-phases';

    protected $description = 'Auto-update summit current_phase based on phase schedules';

    public function handle(): int
    {
        $summits = Summit::where('status', 'published')->get();
        $updated = 0;

        foreach ($summits as $summit) {
            $currentSchedule = SummitPhaseSchedule::where('summit_id', $summit->id)
                ->where('starts_at', '<=', now())
                ->where(function ($q) {
                    $q->whereNull('ends_at')
                        ->orWhere('ends_at', '>', now());
                })
                ->orderBy('starts_at', 'desc')
                ->first();

            if ($currentSchedule && $currentSchedule->phase !== $summit->current_phase) {
                $summit->update(['current_phase' => $currentSchedule->phase]);
                $this->info("Updated {$summit->title}: {$summit->current_phase} → {$currentSchedule->phase}");
                $updated++;
            }
        }

        $this->info("Done. Updated {$updated} summit(s).");

        return self::SUCCESS;
    }
}
