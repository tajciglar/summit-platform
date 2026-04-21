<?php

namespace App\Jobs;

use App\Enums\LandingPageDraftStatus;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
use App\Services\Templates\AudienceResolver;
use App\Services\Templates\PublishDraftService;
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

    public function handle(
        TemplateFiller $filler,
        TemplateRegistry $registry,
        AudienceResolver $audienceResolver,
        PublishDraftService $publisher,
    ): void {
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

            $enabledSections = $this->resolveEnabledSections($registry, $batch);

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

            $this->autoPublishIfRequested($publisher, $batch, $draft);
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

    /**
     * Promote the Ready draft straight to FunnelStep.page_content when the
     * batch was dispatched via the "Generate all steps" funnel action. A
     * publish failure must not fail the generation job — the draft stays
     * Ready and an operator can retry the publish from the draft list.
     */
    private function autoPublishIfRequested(
        PublishDraftService $publisher,
        LandingPageBatch $batch,
        LandingPageDraft $draft,
    ): void {
        if (! $batch->auto_publish) {
            return;
        }

        $user = $batch->publishedByUser;
        if (! $user) {
            report(new \RuntimeException(
                "LandingPageBatch {$batch->id} flagged auto_publish but has no published_by_user_id; skipping auto-publish."
            ));

            return;
        }

        try {
            $publisher->publish($draft->fresh(), $user);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Enabled sections priority: funnel.section_config[step_type] →
     * template default → null. The funnel-level config is what the
     * "Generate all steps" flow relies on to show a different section
     * mix per step while sharing the same skin.
     *
     * @return list<string>|null
     */
    private function resolveEnabledSections(TemplateRegistry $registry, LandingPageBatch $batch): ?array
    {
        if (! $registry->supportsSections($this->templateKey)) {
            return null;
        }

        $step = $batch->funnelStep;
        $funnel = $batch->funnel;
        $supported = $registry->supportedSections($this->templateKey);

        if ($step && $funnel && is_array($funnel->section_config ?? null)) {
            $forStep = $funnel->section_config[$step->step_type] ?? null;
            if (is_array($forStep) && ! empty($forStep)) {
                return array_values(array_intersect($forStep, $supported));
            }
        }

        return $registry->defaultEnabledSections($this->templateKey);
    }
}
