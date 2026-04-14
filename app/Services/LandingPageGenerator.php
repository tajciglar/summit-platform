<?php

namespace App\Services;

use App\Models\Summit;
use App\Services\Blocks\BlockCatalogService;
use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use App\Services\FunnelGenerator\Phases\CopywriterPhase;
use Illuminate\Support\Str;

class LandingPageGenerator
{
    public function __construct(
        private ArchitectPhase      $architect,
        private CopywriterPhase     $copywriter,
        private BlockCatalogService $catalogService,
    ) {}

    /**
     * Generate one landing page (optin step) for the given summit.
     *
     * @return array<int, array{id:string, type:string, version:int, props:array}>
     */
    public function generate(Summit $summit, string $notes = ''): array
    {
        $brief   = $this->buildBrief($summit, $notes);
        $catalog = $this->catalogService->current();

        // Phase 1 — Architect picks blocks for optin only
        $sequence = $this->architect->run($brief, $catalog, ['optin']);

        // Phase 2 — Copywriter fills props
        $blocks = $this->copywriter->run(
            brief:    $brief,
            catalog:  $catalog,
            stepType: 'optin',
            sequence: $sequence['optin'] ?? [],
        );

        // Add UUID ids required for React keys
        return array_map(
            fn (array $block) => array_merge(['id' => (string) Str::uuid()], $block),
            $blocks,
        );
    }

    private function buildBrief(Summit $summit, string $notes): array
    {
        return [
            'summit_name'        => $summit->title,
            'summit_description' => $summit->description ?? '',
            'starts_at'          => $summit->starts_at?->toDateString(),
            'ends_at'            => $summit->ends_at?->toDateString(),
            'notes'              => $notes,
        ];
    }
}
