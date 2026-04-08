<?php

namespace App\Services;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;

class FunnelResolver
{
    /** Resolve a published summit by slug. */
    public function resolveSummit(string $summitSlug): ?Summit
    {
        return Summit::where('slug', $summitSlug)
            ->where('status', 'published')
            ->first();
    }

    /** Resolve a funnel within a summit by slug. */
    public function resolveFunnel(Summit $summit, string $funnelSlug): ?Funnel
    {
        return Funnel::where('summit_id', $summit->id)
            ->where('slug', $funnelSlug)
            ->where('is_active', true)
            ->first();
    }

    /** Resolve a step within a funnel, or fall back to the first step. */
    public function resolveStep(Funnel $funnel, ?string $stepSlug, bool $includeUnpublished = false): ?FunnelStep
    {
        $query = FunnelStep::where('funnel_id', $funnel->id);

        if (! $includeUnpublished) {
            $query->where('is_published', true);
        }

        if ($stepSlug) {
            return $query->where('slug', $stepSlug)->first();
        }

        return $query->orderBy('sort_order')->first();
    }
}
