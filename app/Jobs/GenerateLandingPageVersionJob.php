<?php

namespace App\Jobs;

use App\Models\LandingPageDraft;
use App\Services\LandingPageGenerator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateLandingPageVersionJob implements ShouldQueue
{
    use Queueable;

    // Two-stage pipeline: ~90s Stage 1 + ~120s Stage 2 per section, parallelised.
    // 420s gives ~7 minutes which comfortably covers 10 parallel sections plus retries.
    public int $timeout = 420;

    public int $tries = 1;

    public function __construct(public readonly LandingPageDraft $draft) {}

    public function handle(LandingPageGenerator $generator): void
    {
        $this->draft->update(['status' => 'generating']);

        try {
            $summit = $this->draft->batch->summit;
            $funnel = $this->draft->batch->funnel;
            $notes = $this->draft->batch->notes ?? '';
            $override = $this->draft->batch->style_override_url ?? null;
            $allowed = $this->draft->batch->allowed_types ?? null;

            if (config('features.runtime_gemini_gen')) {
                $sections = $generator->generateSections(
                    summit: $summit,
                    funnel: $funnel,
                    notes: $notes,
                    styleOverrideUrl: $override,
                    allowedTypes: $allowed,
                    draftId: (string) $this->draft->id,
                );
                $this->draft->update([
                    'sections' => $sections,
                    'status' => 'ready',
                ]);
            } else {
                $blocks = $generator->generate($summit, $notes, $override);
                $this->draft->update([
                    'blocks' => $blocks,
                    'status' => 'ready',
                ]);
            }
        } catch (Throwable $e) {
            $this->draft->update([
                'status' => 'failed',
                'error_message' => substr($e->getMessage(), 0, 500),
            ]);
            throw $e;
        }
    }
}
