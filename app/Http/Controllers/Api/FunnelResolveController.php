<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Summit;
use Carbon\Carbon;
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

        $starts = $summit->pre_summit_starts_at
            ? Carbon::parse($summit->pre_summit_starts_at)->startOfDay()
            : null;

        $speakers = $summit->speakers->map(function ($s) use ($starts) {
            $dayNumber = ($starts && $s->goes_live_at)
                ? (int) ($starts->diffInDays(Carbon::parse($s->goes_live_at)->startOfDay()) + 1)
                : 0;

            return [
                'id' => $s->id,
                'firstName' => $s->first_name,
                'lastName' => $s->last_name,
                'fullName' => trim("{$s->first_name} {$s->last_name}"),
                'title' => $s->title,
                'photoUrl' => $s->photo_url,
                'shortBio' => $s->short_bio,
                'longBio' => $s->long_bio,
                'dayNumber' => $dayNumber,
                'masterclassTitle' => $s->masterclass_title,
                'sortOrder' => $s->sort_order,
            ];
        })->values();

        $products = $summit->products->map(function ($p) use ($summit) {
            $price = method_exists($p, 'priceForPhase') ? $p->priceForPhase($summit->current_phase) : null;

            return [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'amountCents' => $price?->amount_cents,
                'compareAtCents' => $price?->compare_at_cents,
                'stripePriceId' => $price?->stripe_price_id,
            ];
        })->values();

        return response()->json([
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
                'starts_at' => $summit->starts_at,
                'ends_at' => $summit->ends_at,
                'current_phase' => $summit->current_phase,
            ],
            'theme' => $funnel->theme ?: $this->defaultTheme(),
            'blocks' => $step->content ?? [],
            'speakers' => $speakers,
            'products' => $products,
        ]);
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
