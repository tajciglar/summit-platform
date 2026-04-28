<?php

namespace App\Actions;

use App\Models\Funnel;
use Illuminate\Support\Facades\DB;

/**
 * Clones a funnel into a destination summit. The copy carries all steps,
 * step `page_content`, step bumps, and step `page_overrides` over verbatim;
 * the only mutated fields are the new summit_id, an optional skin override
 * (`template_key`), and the slug (which gets `-copy` suffixed to dodge the
 * unique index).
 *
 * The new funnel always starts as draft (is_active=false) so duplicating
 * doesn't accidentally take a live funnel offline.
 */
class DuplicateFunnel
{
    public function handle(Funnel $source, string $destinationSummitId, ?string $templateKey = null): Funnel
    {
        return DB::transaction(function () use ($source, $destinationSummitId, $templateKey): Funnel {
            $source->loadMissing(['steps.bumps']);

            $newFunnel = $source->replicate(['created_at', 'updated_at']);
            $newFunnel->summit_id = $destinationSummitId;
            $newFunnel->slug = $this->uniqueSlug($source->slug);
            $newFunnel->name = $source->name.' (copy)';
            $newFunnel->is_active = false;

            if ($templateKey !== null) {
                $newFunnel->template_key = $templateKey;
            }

            $newFunnel->save();

            foreach ($source->steps as $step) {
                $newStep = $step->replicate(['created_at', 'updated_at']);
                $newStep->funnel_id = $newFunnel->id;
                $newStep->save();

                foreach ($step->bumps as $bump) {
                    $newBump = $bump->replicate(['created_at', 'updated_at']);
                    $newBump->funnel_step_id = $newStep->id;
                    $newBump->save();
                }
            }

            return $newFunnel->fresh();
        });
    }

    private function uniqueSlug(string $base): string
    {
        $candidate = $base.'-copy';
        $suffix = 1;

        while (Funnel::where('slug', $candidate)->exists()) {
            $suffix++;
            $candidate = $base.'-copy-'.$suffix;
        }

        return $candidate;
    }
}
