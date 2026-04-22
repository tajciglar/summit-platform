<?php

namespace App\Http\Controllers\Api;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
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

        // Fall back to the funnel's per-step section_config when the step's
        // page_content doesn't carry its own enabled_sections. This is what
        // the template family flow ("one skin, different sections per step")
        // relies on so sales_page renders the sales section mix.
        if (! isset($content['enabled_sections']) && is_array($funnel->section_config ?? null)) {
            $forStep = $funnel->section_config[$stepType] ?? null;
            if (is_array($forStep) && $forStep !== []) {
                $content['enabled_sections'] = array_values($forStep);
            }
        }

        // WP checkout redirect is a sales-page concept; other step types must
        // keep their native CTAs (e.g. optin → modal).
        $wpUrl = $stepType === 'sales_page' ? $funnel->wp_checkout_redirect_url : null;

        return response()->json($this->payload($content, $funnel->summit_id, $funnel->id, $wpUrl));
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
        $wpUrl = $step->step_type === 'sales_page' ? $funnel?->wp_checkout_redirect_url : null;

        return response()->json($this->payload($content, $funnel?->summit_id, $funnel?->id, $wpUrl));
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function payload(array $content, ?string $summitId, ?string $funnelId, ?string $wpCheckoutRedirectUrl = null): array
    {
        $summit = $summitId ? Summit::query()->find($summitId) : null;
        $speakers = $summit
            ? $summit->speakers()->get()->map(fn ($s) => [
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
                'sortOrder' => $s->pivot->sort_order ?? 0,
                'isFeatured' => $s->is_featured,
                'dayNumber' => $s->pivot->day_number,
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
            'wp_checkout_redirect_url' => $wpCheckoutRedirectUrl,
        ];
    }
}
