<?php

namespace App\Http\Controllers\Api;

use App\Models\LandingPageDraft;
use App\Models\Speaker;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class LandingPageDraftController extends Controller
{
    public function showByToken(string $token): JsonResponse
    {
        $draft = LandingPageDraft::with('batch.summit', 'batch.funnel')
            ->where('preview_token', $token)
            ->firstOrFail();

        $batch = $draft->batch;
        $summit = $batch?->summit;
        $funnel = $batch?->funnel;

        $speakers = $summit
            ? Speaker::where('summit_id', $summit->id)
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'firstName' => $s->first_name,
                    'lastName' => $s->last_name,
                    'title' => $s->title,
                    'shortBio' => $s->short_bio,
                    'longBio' => $s->long_bio,
                    'photoUrl' => $s->photo_url,
                    'masterclassTitle' => $s->masterclass_title,
                    'masterclassDescription' => $s->masterclass_description,
                    'rating' => $s->rating,
                    'goesLiveAt' => $s->goes_live_at?->toIso8601String(),
                    'sortOrder' => $s->sort_order,
                    'isFeatured' => $s->is_featured,
                ])
                ->values()
            : collect();

        return response()->json([
            'template_key' => $draft->template_key,
            'content' => $draft->sections ?? $draft->blocks ?? [],
            'enabled_sections' => $draft->enabled_sections,
            'audience' => $draft->audience?->value,
            'palette' => $draft->palette,
            'speakers' => $speakers,
            'funnel_id' => $funnel?->id,
            'wp_checkout_redirect_url' => $funnel?->wp_checkout_redirect_url,
            'status' => $draft->status?->value,
        ]);
    }
}
