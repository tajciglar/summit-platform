<?php

namespace App\Services;

use App\Models\Funnel;
use App\Models\Summit;
use App\Services\Blocks\BlockCatalogService;
use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use App\Services\FunnelGenerator\Phases\CopywriterPhase;
use App\Services\StyleBrief\StyleBriefResolver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LandingPageGenerator
{
    public function __construct(
        private ArchitectPhase $architect,
        private CopywriterPhase $copywriter,
        private BlockCatalogService $catalogService,
        private BlockDesignPhase $blockDesignPhase,
        private StyleBriefResolver $styleBriefResolver,
    ) {}

    /**
     * Generate one landing page (optin step) via the legacy Copywriter pipeline.
     *
     * @return array<int, array{id:string, type:string, version:int, props:array}>
     */
    public function generate(Summit $summit, string $notes = '', ?string $styleReference = null): array
    {
        $brief = $this->buildBrief($summit, $notes, $styleReference);
        $catalog = $this->catalogService->current();

        $sequence = $this->architect->run($brief, $catalog, ['optin']);

        $blocks = $this->copywriter->run(
            brief: $brief,
            catalog: $catalog,
            stepType: 'optin',
            sequence: $sequence['optin'] ?? [],
        );

        return array_map(
            fn (array $block) => array_merge(['id' => (string) Str::uuid()], $block),
            $blocks,
        );
    }

    /**
     * Generate sections via the multi-stage runtime pipeline.
     *
     * When a styleOverrideUrl is provided the pipeline auto-extracts a fresh
     * style brief from that URL (screenshot → Gemini Vision) and saves it on
     * the funnel so subsequent generations reuse it without re-extraction.
     *
     * @return array<int, array{id:string, type:string, jsx:string, fields:array, status:string, ...}>
     */
    public function generateSections(
        Summit $summit,
        ?Funnel $funnel,
        string $notes = '',
        ?string $styleOverrideUrl = null,
        ?array $allowedTypes = null,
        string $draftId = '',
    ): array {
        $brief = $this->buildBrief($summit, $notes, $styleOverrideUrl);
        $catalog = $this->catalogService->current();

        $sequence = $this->architect->run($brief, $catalog, ['optin'], $allowedTypes);
        $names = $sequence['optin'] ?? [];
        $total = count($names);

        $sectionBriefs = [];
        foreach ($names as $i => $name) {
            $sectionBriefs[] = [
                'type' => $name,
                'purpose' => '',
                'position' => $i + 1,
                'total' => $total,
            ];
        }

        $context = $summit->buildSummitContext();

        // Auto-extract style brief from URL when provided.
        $referencePath = null;
        $targetFunnel = $funnel ?? $summit->funnels->first();

        if (! empty($styleOverrideUrl)) {
            $extracted = $this->extractStyleBriefFromUrl($styleOverrideUrl, $context, $summit->id);
            if ($extracted) {
                // Save extracted brief on the funnel for future generations.
                if ($targetFunnel) {
                    $targetFunnel->update(['style_brief_override' => $extracted['brief']]);
                }
                // Save reference screenshot for Stage 1 visual anchor.
                if (! empty($extracted['reference_path'])) {
                    $referencePath = $extracted['reference_path'];
                }
            }
        }

        if (! $referencePath) {
            $referencePath = "style-briefs/{$summit->id}/reference.png";
            if (! Storage::disk('public')->exists($referencePath)) {
                $referencePath = null;
            }
        }

        $styleBrief = $this->styleBriefResolver->resolveForFunnel($targetFunnel);

        return $this->blockDesignPhase->run(
            sectionBriefs: $sectionBriefs,
            summitContext: $context,
            styleBrief: $styleBrief,
            referencePath: $referencePath,
            draftId: $draftId,
        );
    }

    /**
     * Extract a style brief from a URL via screenshot + Gemini Vision.
     *
     * @return array{brief: array, reference_path: string|null}|null
     */
    private function extractStyleBriefFromUrl(string $url, array $summitContext, int|string $summitId): ?array
    {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');

        try {
            $resp = Http::withToken($token)
                ->timeout(120)
                ->post("{$base}/api/style-briefs/build", [
                    'url' => $url,
                    'summit_context' => $summitContext,
                ]);

            if (! $resp->successful() || $resp->json('status') !== 'ready') {
                Log::warning('Style brief extraction failed', [
                    'url' => $url,
                    'status' => $resp->json('status'),
                    'error' => $resp->json('error'),
                ]);
                return null;
            }

            $brief = $resp->json('brief') ?? [];
            $referencePath = null;

            // Persist the reference screenshot so Stage 1 can use it.
            $pngBase64 = $resp->json('reference_png_base64');
            if ($pngBase64) {
                $path = "style-briefs/{$summitId}/reference.png";
                Storage::disk('public')->put($path, base64_decode($pngBase64));
                $referencePath = $path;
            }

            return ['brief' => $brief, 'reference_path' => $referencePath];
        } catch (\Throwable $e) {
            Log::warning('Style brief extraction threw', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    protected function buildBrief(Summit $summit, string $notes, ?string $styleReference = null): array
    {
        return [
            'summit_name' => $summit->title,
            'summit_description' => $summit->description ?? '',
            'starts_at' => $summit->starts_at?->toDateString(),
            'ends_at' => $summit->ends_at?->toDateString(),
            'notes' => $notes,
            'style_reference' => $styleReference,
        ];
    }
}
