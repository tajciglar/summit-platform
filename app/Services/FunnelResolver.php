<?php

namespace App\Services;

use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;

class FunnelResolver
{
    /**
     * Resolve the funnel for a given domain + funnel slug.
     * Returns null if not found or inactive.
     */
    public function resolveFunnel(Domain $domain, string $funnelSlug): ?Funnel
    {
        return Funnel::where('domain_id', $domain->id)
            ->where('slug', $funnelSlug)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Resolve a specific step by slug, or fall back to the first step.
     */
    public function resolveStep(Funnel $funnel, ?string $stepSlug): ?FunnelStep
    {
        $query = FunnelStep::where('funnel_id', $funnel->id)
            ->where('is_active', true);

        if ($stepSlug) {
            return $query->where('slug', $stepSlug)->first();
        }

        // No step slug — return the first step (optin)
        return $query->orderBy('sort_order')->first();
    }
}
