<?php

namespace App\Actions;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\FunnelStepBump;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitPage;
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
            $newSummit->current_phase = 'pre';

            foreach (['pre_summit_starts_at', 'late_pre_summit_starts_at', 'during_summit_starts_at', 'post_summit_starts_at', 'ends_at'] as $field) {
                if ($summit->{$field}) {
                    $newSummit->{$field} = $summit->{$field}->copy()->addYear();
                }
            }

            $newSummit->save();

            $this->clonePages($summit, $newSummit);
            $this->cloneSpeakers($summit, $newSummit);
            $productMap = $this->cloneProducts($summit, $newSummit);
            $this->cloneFunnels($summit, $newSummit, $productMap);

            return $newSummit;
        });
    }

    private function clonePages(Summit $src, Summit $dest): void
    {
        foreach ($src->pages as $page) {
            $clone = $page->replicate(['created_at', 'updated_at']);
            $clone->summit_id = $dest->id;
            $clone->save();
        }
    }

    private function cloneSpeakers(Summit $src, Summit $dest): void
    {
        foreach ($src->speakers as $speaker) {
            $clone = $speaker->replicate(['created_at', 'updated_at']);
            $clone->summit_id = $dest->id;
            // Slugs are (summit_id, slug) unique, so reusing is fine — but if same summit gets cloned again we'd collide. Fresh dest = safe.
            $clone->save();
        }
    }

    /**
     * @return array<string, string> map from old product id to new product id
     */
    private function cloneProducts(Summit $src, Summit $dest): array
    {
        $map = [];

        // Clone non-combos first so combos can remap their bundled_product_ids afterward.
        foreach ($src->products()->where('kind', '!=', 'combo')->get() as $product) {
            $clone = $product->replicate(['created_at', 'updated_at', 'stripe_product_id', 'stripe_price_pre_id', 'stripe_price_late_id', 'stripe_price_during_id', 'stripe_price_post_id']);
            $clone->summit_id = $dest->id;
            $clone->save();
            $map[$product->id] = $clone->id;
        }

        foreach ($src->products()->where('kind', 'combo')->get() as $combo) {
            $clone = $combo->replicate(['created_at', 'updated_at', 'stripe_product_id']);
            $clone->summit_id = $dest->id;
            $clone->bundled_product_ids = collect($combo->bundled_product_ids ?? [])
                ->map(fn ($id) => $map[$id] ?? null)
                ->filter()
                ->values()
                ->all();
            $clone->save();
            $map[$combo->id] = $clone->id;
        }

        return $map;
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
