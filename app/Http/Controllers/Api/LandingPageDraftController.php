<?php

namespace App\Http\Controllers\Api;

use App\Models\LandingPageDraft;
use App\Models\Speaker;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;

class LandingPageDraftController extends Controller
{
    public function showByToken(string $token): JsonResponse
    {
        $draft = LandingPageDraft::with('batch')->where('preview_token', $token)->firstOrFail();

        $batch = $draft->batch;
        $summit = $batch->summit;
        $funnel = $batch->funnel;

        $starts = $summit->pre_summit_starts_at ? Carbon::parse($summit->pre_summit_starts_at)->startOfDay() : null;

        $speakers = $summit->summitSpeakers->map(function ($ss) use ($starts) {
            $dayNumber = ($starts && $ss->presentation_day)
                ? (int) ($starts->diffInDays(Carbon::parse($ss->presentation_day)->startOfDay()) + 1)
                : 0;
            $s = $ss->speaker;

            return [
                'id' => $s->id,
                'firstName' => $s->first_name,
                'lastName' => $s->last_name,
                'fullName' => trim("{$s->first_name} {$s->last_name}"),
                'title' => $s->title,
                'photoUrl' => $s->photo_url,
                'shortDescription' => $s->short_description,
                'longDescription' => $s->long_description,
                'dayNumber' => (int) $dayNumber,
                'masterclassTitle' => $ss->masterclass_title,
                'sortOrder' => $ss->sort_order,
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
            'blocks' => $draft->blocks ?? [],
            'sections' => $draft->sections ?? [],
            'summit' => [
                'id' => $summit->id,
                'title' => $summit->title,
                'description' => $summit->description,
                'starts_at' => $summit->pre_summit_starts_at,
                'ends_at' => $summit->ends_at,
                'current_phase' => $summit->current_phase,
            ],
            'theme' => $this->normaliseTheme($funnel?->theme),
            'speakers' => $speakers,
            'products' => $products,
            'draft' => [
                'id' => $draft->id,
                'version_number' => $draft->version_number,
                'status' => $draft->status,
            ],
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

    private function normaliseTheme(mixed $raw): array
    {
        $defaults = $this->defaultTheme();
        if (! is_array($raw) || $raw === []) {
            return $defaults;
        }

        if (isset($raw['primaryColor']) || isset($raw['accentColor'])) {
            return array_merge($defaults, array_filter($raw, fn ($v) => $v !== null));
        }

        $colors = is_array($raw['colors'] ?? null) ? $raw['colors'] : [];
        $fonts = is_array($raw['fonts'] ?? null) ? $raw['fonts'] : [];

        return [
            'primaryColor' => $colors['primary'] ?? $defaults['primaryColor'],
            'accentColor' => $colors['accent'] ?? $defaults['accentColor'],
            'fontHeading' => $fonts['heading'] ?? $defaults['fontHeading'],
            'fontBody' => $fonts['body'] ?? $defaults['fontBody'],
            'logoUrl' => $raw['logo_url'] ?? $raw['logoUrl'] ?? $defaults['logoUrl'],
            'backgroundStyle' => $raw['backgroundStyle'] ?? $defaults['backgroundStyle'],
        ];
    }
}
