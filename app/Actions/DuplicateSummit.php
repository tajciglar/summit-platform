<?php

namespace App\Actions;

use App\Models\Funnel;
use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Support\Facades\DB;

/**
 * Clones an entire summit + all its children (pages, speakers, products, funnels,
 * funnel steps, and order bumps) into a brand-new summit marked draft.
 *
 * Slugs get "-copy" appended to avoid unique-index collisions. Phase dates shift
 * forward by 1 year so the new summit is roughly where it'd be next cycle.
 */
class DuplicateSummit
{
    public function handle(Summit $summit): Summit
    {
        return DB::transaction(function () use ($summit): Summit {
            $newSummit = $summit->replicate(['created_at', 'updated_at']);
            $newSummit->slug = $this->uniqueSlug($summit->slug, Summit::class);
            $newSummit->title = $summit->title.' (copy)';
            $newSummit->status = 'draft';
            $newSummit->current_phase = 'summit_starts';

            foreach (['pre_summit_starts_at', 'late_pre_summit_starts_at', 'during_summit_starts_at', 'post_summit_starts_at', 'ends_at'] as $field) {
                if ($summit->{$field}) {
                    $newSummit->{$field} = $summit->{$field}->copy()->addYear();
                }
            }

            $newSummit->save();

            $this->cloneSpeakers($summit, $newSummit);
            $productMap = $this->cloneProducts($summit, $newSummit);
            $this->cloneFunnels($summit, $newSummit, $productMap);

            return $newSummit;
        });
    }

    private function cloneSpeakers(Summit $src, Summit $dest): void
    {
        // Speakers are M2M via `speaker_summit`; pivot carries per-summit
        // day_number + sort_order. We duplicate each speaker as an
        // independent record (so destination summit edits don't mutate
        // the source speaker) and attach to the destination with the
        // source's pivot values.
        foreach ($src->speakers as $speaker) {
            $clone = $speaker->replicate(['created_at', 'updated_at']);
            $clone->save();

            $dest->speakers()->attach($clone->id, [
                'day_number' => $speaker->pivot->day_number,
                'sort_order' => $speaker->pivot->sort_order ?? 0,
            ]);
        }
    }

    /**
     * Products are global since the product_summit pivot was introduced. Duplicating
     * a summit now just attaches the source summit's products to the new summit —
     * no cloning, no slug collisions. Funnel steps keep pointing at the same products.
     *
     * @return array<string, string> identity map (retained for cloneFunnels's API)
     */
    private function cloneProducts(Summit $src, Summit $dest): array
    {
        $productIds = $src->products()->pluck('products.id')->all();

        $dest->products()->syncWithoutDetaching($productIds);

        return array_combine($productIds, $productIds);
    }

    /**
     * @param  array<string, string>  $productMap
     */
    private function cloneFunnels(Summit $src, Summit $dest, array $productMap): void
    {
        foreach ($src->funnels as $funnel) {
            $newFunnel = $funnel->replicate(['created_at', 'updated_at']);
            $newFunnel->summit_id = $dest->id;
            $newFunnel->save();

            foreach ($funnel->steps as $step) {
                $newStep = $step->replicate(['created_at', 'updated_at']);
                $newStep->funnel_id = $newFunnel->id;
                $newStep->product_id = $step->product_id ? ($productMap[$step->product_id] ?? null) : null;
                $newStep->save();

                foreach ($step->bumps as $bump) {
                    $newBump = $bump->replicate(['created_at', 'updated_at']);
                    $newBump->funnel_step_id = $newStep->id;
                    $newBump->product_id = $productMap[$bump->product_id] ?? $bump->product_id;
                    $newBump->save();
                }
            }
        }
    }

    private function uniqueSlug(string $base, string $modelClass): string
    {
        $candidate = $base.'-copy';
        $suffix = 1;

        while ($modelClass::where('slug', $candidate)->exists()) {
            $suffix++;
            $candidate = $base.'-copy-'.$suffix;
        }

        return $candidate;
    }
}
