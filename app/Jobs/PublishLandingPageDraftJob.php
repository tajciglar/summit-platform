<?php

namespace App\Jobs;

use App\Models\LandingPageDraft;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class PublishLandingPageDraftJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly string $draftId) {}

    public function handle(): void
    {
        $draft = LandingPageDraft::findOrFail($this->draftId);
        $sections = $draft->sections ?? [];
        foreach ($sections as $s) {
            if (($s['status'] ?? null) !== 'ready') {
                throw new \RuntimeException("cannot publish: section {$s['id']} status is {$s['status']}");
            }
        }

        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        $resp = Http::withToken($token)->timeout(60)->post("{$base}/api/drafts/{$draft->id}/publish", [
            'sections' => $sections,
        ]);

        if (!$resp->successful()) {
            throw new \RuntimeException("publish failed: HTTP {$resp->status()} — {$resp->body()}");
        }
        $body = $resp->json();
        $draft->update([
            'published_html'               => $body['html'] ?? '',
            'published_hydration_manifest' => $body['manifest'] ?? [],
            'status'                       => 'published',
        ]);
    }
}
