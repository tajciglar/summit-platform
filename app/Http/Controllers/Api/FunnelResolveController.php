<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SpeakerResource;
use App\Models\Summit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FunnelResolveController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'summit_slug' => ['required', 'string'],
            'funnel_slug' => ['required', 'string'],
            'step_slug' => ['nullable', 'string'],
        ]);

        $summit = Summit::where('slug', $validated['summit_slug'])->first();
        abort_if(! $summit, 404, 'Unknown summit');

        $funnel = $summit->funnels()->where('slug', $validated['funnel_slug'])->first();
        abort_if(! $funnel, 404, 'Unknown funnel');

        $stepSlug = $validated['step_slug'] ?? 'optin';
        $step = $funnel->steps()->where('slug', $stepSlug)->first();
        abort_if(! $step, 404, "No step with slug {$stepSlug}");

        $summit->loadMissing(['speakers', 'products.prices']);

        ProductResource::$phase = $summit->current_phase;

        try {
            $payload = [
                'funnel' => [
                    'id' => $funnel->id,
                    'slug' => $funnel->slug,
                    'name' => $funnel->name,
                ],
                'step' => [
                    'id' => $step->id,
                    'type' => $step->step_type,
                    'slug' => $step->slug,
                ],
                'summit' => [
                    'id' => $summit->id,
                    'title' => $summit->title,
                    'description' => $summit->description,
                    'starts_at' => $summit->during_summit_starts_at ?? $summit->pre_summit_starts_at,
                    'ends_at' => $summit->ends_at,
                    'current_phase' => $summit->current_phase,
                    'event_status_label' => $summit->eventStatusLabel(),
                ],
                'theme' => $funnel->theme ?: $this->defaultTheme(),
                'blocks' => $step->content ?? [],
                'speakers' => SpeakerResource::collection($summit->speakers)->toArray($request),
                'products' => ProductResource::collection($summit->products)->toArray($request),
            ];
        } finally {
            ProductResource::$phase = null;
        }

        return response()->json($payload);
    }

    private function defaultTheme(): array
    {
        return [
            'primaryColor' => '#5e4d9b',
            'accentColor' => '#00b553',
            'fontHeading' => 'Inter',
            'fontBody' => 'Inter',
            'logoUrl' => null,
            'backgroundStyle' => 'light',
        ];
    }
}
