<?php

namespace App\Console\Commands;

use App\Models\Summit;
use Illuminate\Console\Command;

class UpdateSummitPhases extends Command
{
    protected $signature = 'summits:update-phases';

    protected $description = 'Auto-update summit current_phase by comparing NOW() against inline phase dates';

    public function handle(): int
    {
        $summits = Summit::where('status', 'published')->get();
        $updated = 0;

        foreach ($summits as $summit) {
            $nextPhase = $summit->computePhase();

            if ($nextPhase !== null && $nextPhase !== $summit->current_phase) {
                $previous = $summit->current_phase;
                $summit->update(['current_phase' => $nextPhase]);
                $this->info("Updated {$summit->title}: {$previous} → {$nextPhase}");
                $updated++;
            }
        }

        $this->info("Done. Updated {$updated} summit(s).");

        return self::SUCCESS;
    }
}
