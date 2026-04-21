<?php

namespace App\Http\Controllers\Api;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PublicFunnelController extends Controller
{
    public function show(Request $request, string $funnelId): JsonResponse
    {
        $stepType = $request->query('step_type', 'optin');

        $funnel = Funnel::with(['steps' => fn ($q) => $q->where('step_type', $stepType)])
            ->findOrFail($funnelId);

        $step = $funnel->steps->first();
        $content = $step?->page_content ?? null;

        if (! $content || ! isset($content['template_key'])) {
            return response()->json(['error' => 'no published content'], 404);
        }

        return response()->json($this->payload($content, $funnel->summit_id, $funnel->id));
    }

    /**
     * Admin-facing preview that mirrors the exact `page_content` of a single
     * step. Used by the Filament "Preview live" button so block edits appear
     * in preview immediately, without going through a draft publish.
     */
    public function showStep(FunnelStep $step): JsonResponse
    {
        $content = $step->page_content;

        if (! is_array($content) || ! isset($content['template_key'])) {
            return response()->json(['error' => 'step has no editable page_content'], 404);
        }

        $funnel = $step->funnel;

        return response()->json($this->payload($content, $funnel?->summit_id, $funnel?->id));
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function payload(array $content, ?string $summitId, ?string $funnelId): array
    {
        $speakers = $summitId
            ? Speaker::where('summit_id', $summitId)->get()->map(fn ($s) => [
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
            : collect();

        return [
            'template_key' => $content['template_key'],
            'content' => $content['content'] ?? [],
            'enabled_sections' => $content['enabled_sections'] ?? null,
            'audience' => $content['audience'] ?? null,
            'palette' => $content['palette'] ?? null,
            'speakers' => $speakers,
            'funnel_id' => $funnelId,
        ];
    }
}
