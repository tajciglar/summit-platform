<?php

namespace App\Jobs;

use App\Enums\LandingPageDraftStatus;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
use App\Services\Templates\AudienceResolver;
use App\Services\Templates\TemplateFiller;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class GenerateLandingPageVersionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;

    public int $timeout = 180;

    public function __construct(
        public string $batchId,
        public string $templateKey,
        public int $versionNumber,
    ) {}

    /**
     * Backoff schedule (seconds) for retries triggered by transient errors
     * like Anthropic 429 rate-limit responses. Lets the rolling-minute
     * output-token budget clear before we try again.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 120, 180];
    }

    public function handle(TemplateFiller $filler, TemplateRegistry $registry, AudienceResolver $audienceResolver): void
    {
        $batch = LandingPageBatch::findOrFail($this->batchId);

        // Use firstOrCreate so retries don't trip the unique (batch_id, version_number)
        // constraint — the draft row from the first attempt is still there.
        $draft = LandingPageDraft::firstOrCreate(
            [
                'batch_id' => $batch->id,
                'version_number' => $this->versionNumber,
            ],
            [
                'template_key' => $this->templateKey,
                'status' => LandingPageDraftStatus::Generating,
                'preview_token' => Str::random(40),
            ]
        );

        $start = microtime(true);
        try {
            $summit = $batch->summit;
            $speakers = Speaker::query()
                ->where('summit_id', $summit->id)
                ->whereNotNull('goes_live_at')
                ->orderBy('goes_live_at')
                ->orderBy('sort_order')
                ->get();

            $result = $filler->fill(
                summit: $summit,
                templateKey: $this->templateKey,
                speakers: $speakers,
                notes: $batch->notes,
                styleReferenceUrl: $batch->style_reference_url,
            );

            $enabledSections = $registry->supportsSections($this->templateKey)
                ? $registry->defaultEnabledSections($this->templateKey)
                : null;

            $audienceEnum = $audienceResolver->resolveEnum($batch);
            $palette = $audienceResolver->resolveForBatch($batch);

            $draft->update([
                'sections' => $result['content'],
                'enabled_sections' => $enabledSections,
                'audience' => $audienceEnum,
                'palette' => $palette,
                'token_count' => $result['tokens'],
                'generation_ms' => (int) ((microtime(true) - $start) * 1000),
                'status' => LandingPageDraftStatus::Ready,
            ]);
        } catch (\Throwable $e) {
            if ($this->isRateLimitError($e) && $this->attempts() < $this->tries) {
                // Keep the draft in generating state and let Laravel retry
                // after the backoff() window — the rolling-minute output
                // token budget will have cleared by then.
                $draft->update([
                    'generation_ms' => (int) ((microtime(true) - $start) * 1000),
                ]);
                throw $e;
            }

            $draft->update([
                'status' => LandingPageDraftStatus::Failed,
                'error_message' => substr($e->getMessage(), 0, 500),
                'generation_ms' => (int) ((microtime(true) - $start) * 1000),
            ]);
            report($e);
        }
    }

    private function isRateLimitError(\Throwable $e): bool
    {
        $m = $e->getMessage();

        return str_contains($m, '429') || str_contains($m, 'rate_limit_error');
    }
}
