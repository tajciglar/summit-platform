<?php

namespace App\Console\Commands;

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Optin;
use Illuminate\Console\Command;

class SyncUnsyncedOptins extends Command
{
    protected $signature = 'optins:sync-activecampaign {--limit=100 : Max optins to process per run}';

    protected $description = 'Dispatch AC sync jobs for optins that haven\'t been synced yet';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');

        $optins = Optin::where('activecampaign_synced', false)
            ->orderBy('created_at')
            ->limit($limit)
            ->get();

        if ($optins->isEmpty()) {
            $this->info('No unsynced optins found.');

            return self::SUCCESS;
        }

        foreach ($optins as $optin) {
            SyncOptinToActiveCampaign::dispatch($optin);
        }

        $this->info("Dispatched {$optins->count()} optin(s) for AC sync.");

        return self::SUCCESS;
    }
}
