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

    // Must exceed BlockDesignPhase HTTP timeout (180s) so a slow section
    // doesn't cause the job itself to time out before it can report the
    // failure back through the defensive error handler.
    public int $timeout = 240;
    public int $tries   = 1;

    public function __construct(public readonly LandingPageDraft $draft) {}

    public function handle(LandingPageGenerator $generator): void
    {
        $this->draft->update(['status' => 'generating']);

        try {
            $summit = $this->draft->batch->summit;
            $notes  = $this->draft->batch->notes ?? '';
            $styleRef = $this->draft->batch->style_reference;

            if (config('features.runtime_gemini_gen')) {
                $sections = $generator->generateSections($summit, $notes, $styleRef);
                $this->draft->update([
                    'sections' => $sections,
                    'status'   => 'ready',
                ]);
            } else {
                $blocks = $generator->generate($summit, $notes, $styleRef);
                $this->draft->update([
                    'blocks' => $blocks,
                    'status' => 'ready',
                ]);
            }
        } catch (Throwable $e) {
            $this->draft->update([
                'status'        => 'failed',
                'error_message' => substr($e->getMessage(), 0, 500),
            ]);
            throw $e;
        }
    }
}
