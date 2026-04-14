<?php

namespace App\Services\FunnelGenerator;

use App\Models\FunnelGeneration;
use App\Services\Blocks\BlockCatalogService;
use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use App\Services\FunnelGenerator\Phases\CopywriterPhase;
use Throwable;

class FunnelGenerator
{
    private const STEP_TYPES = ['optin', 'sales_page', 'upsell', 'thank_you'];

    public function __construct(
        private ArchitectPhase $architect,
        private CopywriterPhase $copywriter,
        private FunnelBlockMapper $mapper,
        private BlockCatalogService $catalogService,
    ) {}

    public function generate(FunnelGeneration $generation): void
    {
        $generation->update([
            'status' => 'architecting',
            'progress' => 5,
            'started_at' => now(),
        ]);

        try {
            $catalog = $this->catalogService->current();
            $brief = $generation->brief;

            // Phase 1 — Architect picks block sequence
            $sequence = $this->architect->run($brief, $catalog, self::STEP_TYPES);
            $generation->update(['architect_output' => $sequence, 'progress' => 25, 'status' => 'writing']);

            // Phase 2 — Copywriter fills props per step (sequential)
            $output = [];
            $progressPerStep = (100 - 25 - 5) / count(self::STEP_TYPES); // 17.5% each → ~70% total
            $i = 0;
            foreach (self::STEP_TYPES as $stepType) {
                $generation->update(['current_step' => $stepType]);
                $output[$stepType] = $this->copywriter->run(
                    brief: $brief,
                    catalog: $catalog,
                    stepType: $stepType,
                    sequence: $sequence[$stepType] ?? [],
                );
                $generation->update(['progress' => (int) (25 + ($progressPerStep * ++$i))]);
            }

            $name = $brief['summit_name'] ?? $generation->summit->title;
            $funnel = $this->mapper->persist($generation->summit, $name, $output);

            $generation->update([
                'funnel_id' => $funnel->id,
                'status' => 'completed',
                'progress' => 100,
                'current_step' => null,
                'completed_at' => now(),
            ]);
        } catch (Throwable $e) {
            $generation->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);
            throw $e;
        }
    }
}
