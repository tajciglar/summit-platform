<?php

namespace App\Console\Commands;

use App\Models\Summit;
use App\Models\SummitDailyReport;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateDailyReports extends Command
{
    protected $signature = 'reports:generate-daily {--date= : Date to generate for (defaults to yesterday)}';

    protected $description = 'Auto-generate daily report rows for active summits and fill computable metrics';

    public function handle(): int
    {
        $date = $this->option('date')
            ? Carbon::parse($this->option('date'))
            : Carbon::yesterday();

        $summits = Summit::where('status', 'published')
            ->where('starts_at', '<=', $date->copy()->endOfDay())
            ->where(function ($q) use ($date) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', $date->copy()->subDays(30));
            })
            ->get();

        $created = 0;
        $updated = 0;

        foreach ($summits as $summit) {
            $report = SummitDailyReport::firstOrNew([
                'summit_id' => $summit->id,
                'report_date' => $date->toDateString(),
            ]);

            $isNew = ! $report->exists;
            $report->recalculateFromSource();
            $report->save();

            $isNew ? $created++ : $updated++;
        }

        $this->info("Daily reports for {$date->toDateString()}: {$created} created, {$updated} updated.");

        return self::SUCCESS;
    }
}
