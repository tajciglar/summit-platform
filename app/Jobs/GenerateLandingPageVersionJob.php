<?php

namespace App\Jobs;

use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Speaker;
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

    public int $tries = 3;

    public int $timeout = 180;

    public function __construct(
        public string $batchId,
        public string $templateKey,
        public int $versionNumber,
    ) {}

    public function handle(TemplateFiller $filler, TemplateRegistry $registry): void
    {
        $batch = LandingPageBatch::findOrFail($this->batchId);

        $draft = LandingPageDraft::create([
            'batch_id' => $batch->id,
            'version_number' => $this->versionNumber,
            'template_key' => $this->templateKey,
            'status' => 'generating',
            'preview_token' => Str::random(40),
        ]);

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

            $draft->update([
                'sections' => $result['content'],
                'enabled_sections' => $enabledSections,
                'token_count' => $result['tokens'],
                'generation_ms' => (int) ((microtime(true) - $start) * 1000),
                'status' => 'ready',
            ]);
        } catch (\Throwable $e) {
            $draft->update([
                'status' => 'failed',
                'error_message' => substr($e->getMessage(), 0, 500),
                'generation_ms' => (int) ((microtime(true) - $start) * 1000),
            ]);
            report($e);
        }
    }
}
