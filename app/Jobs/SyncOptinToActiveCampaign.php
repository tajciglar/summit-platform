<?php

namespace App\Jobs;

use App\Models\Optin;
use App\Services\ActiveCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncOptinToActiveCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(private readonly Optin $optin) {}

    public function handle(ActiveCampaignService $ac): void
    {
        $tagId = config('services.activecampaign.optin_tag_id');

        $acContactId = $ac->syncContactWithTags(
            $this->optin->email,
            $this->optin->first_name ?? $this->optin->email,
            $tagId ? [$tagId] : [],
        );

        $this->optin->update(['activecampaign_synced' => true]);

        if ($acContactId && $this->optin->contact_id) {
            \App\Models\Contact::where('id', $this->optin->contact_id)
                ->whereNull('ac_contact_id')
                ->update(['ac_contact_id' => $acContactId]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('SyncOptinToActiveCampaign failed permanently', [
            'optin_id' => $this->optin->id,
            'email' => $this->optin->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
