<?php

namespace App\Jobs;

use App\Models\AppSettings;
use App\Models\Contact;
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
        $this->optin->loadMissing(['funnel', 'summit', 'contact']);

        // The opt-in tag now lives on the funnel. Fall back to the funnel's
        // summit's tag is intentionally not provided — once migrated, the tag
        // is funnel-scoped only.
        $tagName = $this->optin->funnel?->ac_optin_tag;

        if (! $tagName) {
            $this->optin->update(['ac_sync_status' => 'synced', 'ac_synced_at' => now()]);

            return;
        }

        $contactId = $ac->findOrCreateContact(
            $this->optin->email,
            $this->optin->first_name ?? $this->optin->email,
        );

        $tagId = $ac->findOrCreateTagByName($tagName);
        $ac->addTag($contactId, $tagId);

        $listId = AppSettings::current()->activecampaign_list_id;
        if ($listId) {
            $ac->addContactToList((string) $contactId, $listId);
        }

        $this->optin->update([
            'ac_sync_status' => 'synced',
            'ac_synced_at' => now(),
            'ac_sync_error' => null,
        ]);

        if ($this->optin->contact_id) {
            Contact::where('id', $this->optin->contact_id)
                ->whereNull('ac_contact_id')
                ->update(['ac_contact_id' => (string) $contactId]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->optin->update([
            'ac_sync_status' => 'failed',
            'ac_sync_error' => $exception->getMessage(),
        ]);

        Log::critical('SyncOptinToActiveCampaign failed permanently', [
            'optin_id' => $this->optin->id,
            'email' => $this->optin->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
