<?php

namespace App\Jobs;

use App\Models\Summit;
use App\Services\StyleBrief\StyleBriefClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class BuildStyleBriefJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 180;

    public int $tries = 1;

    public function __construct(public readonly string $summitId) {}

    public function handle(StyleBriefClient $client): void
    {
        /** @var Summit $summit */
        $summit = Summit::findOrFail($this->summitId);
        $summit->update(['style_brief_status' => 'building']);

        $url = $summit->style_reference_url ?? '';
        if (! $url) {
            $summit->update(['style_brief_status' => 'failed']);
            return;
        }

        try {
            $result = $client->build(
                summitId: $this->summitId,
                url: $url,
                summitContext: $summit->buildSummitContext(),
            );

            $isReady = ($result['status'] ?? null) === 'ready' && ! empty($result['brief']);
            $summit->update([
                'style_brief' => $isReady ? $result['brief'] : $summit->style_brief,
                'style_brief_status' => $isReady ? 'ready' : 'failed',
                'style_brief_built_at' => now(),
            ]);
        } catch (Throwable $e) {
            $summit->update([
                'style_brief_status' => 'failed',
                'style_brief_built_at' => now(),
            ]);
            throw $e;
        }
    }
}
