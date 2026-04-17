<?php

namespace App\Http\Controllers\Api;

use App\Models\Funnel;
use App\Models\Speaker;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class PublicFunnelController extends Controller
{
    public function show(string $funnelId): JsonResponse
    {
        $funnel = Funnel::with(['steps' => fn ($q) => $q->where('step_type', 'optin')])
            ->findOrFail($funnelId);

        $step = $funnel->steps->first();
        $content = $step?->page_content ?? null;

        if (! $content || ! isset($content['template_key'])) {
            return response()->json(['error' => 'no published content'], 404);
        }

        $speakers = Speaker::where('summit_id', $funnel->summit_id)->get()
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
            ]);

        return response()->json([
            'template_key' => $content['template_key'],
            'content' => $content['content'] ?? [],
            'speakers' => $speakers,
        ]);
    }
}
