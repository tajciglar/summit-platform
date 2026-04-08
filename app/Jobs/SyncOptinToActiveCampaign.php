<?php

namespace App\Jobs;

use App\Services\ActiveCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncOptinToActiveCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(
        private readonly string $email,
        private readonly string $name,
    ) {}

    public function handle(ActiveCampaignService $ac): void
    {
        $tagId = config('services.activecampaign.optin_tag_id');

        $ac->syncContactWithTags($this->email, $this->name, $tagId ? [$tagId] : []);
    }
}
