<?php

namespace App\Services;

use App\Models\Funnel;
use App\Models\Summit;
use App\Services\Blocks\BlockCatalogService;
use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use App\Services\FunnelGenerator\Phases\CopywriterPhase;
use App\Services\StyleBrief\StyleBriefResolver;
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
     * Generate sections via the two-stage runtime pipeline (Stage 1 image → Stage 2 code).
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
        if (! empty($styleOverrideUrl)) {
            $context['style_reference_url'] = $styleOverrideUrl;
        }

        $styleBrief = $this->styleBriefResolver->resolveForFunnel(
            $funnel ?? $summit->funnels->first(),
        );

        $referencePath = "style-briefs/{$summit->id}/reference.png";
        if (! Storage::disk('public')->exists($referencePath)) {
            $referencePath = null;
        }

        return $this->blockDesignPhase->run(
            sectionBriefs: $sectionBriefs,
            summitContext: $context,
            styleBrief: $styleBrief,
            referencePath: $referencePath,
            draftId: $draftId,
        );
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
