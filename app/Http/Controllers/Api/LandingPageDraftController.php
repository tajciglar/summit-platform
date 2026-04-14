<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPageDraft;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandingPageDraftController extends Controller
{
    public function __invoke(Request $request, string $token): JsonResponse
    {
        $draft = LandingPageDraft::where('preview_token', $token)
            ->whereIn('status', ['ready', 'approved'])
            ->with([
                'batch.summit.summitSpeakers.speaker',
                'batch.summit.products.prices',
                'batch.funnel',
            ])
            ->first();

        abort_if(! $draft, 404, 'Draft not found or not ready');

        $batch  = $draft->batch;
        $summit = $batch->summit;
        $funnel = $batch->funnel;

        $starts = $summit->starts_at ? Carbon::parse($summit->starts_at)->startOfDay() : null;

        $speakers = $summit->summitSpeakers->map(function ($ss) use ($starts) {
            $dayNumber = ($starts && $ss->presentation_day)
                ? (int) ($starts->diffInDays(Carbon::parse($ss->presentation_day)->startOfDay()) + 1)
                : 0;
            $s = $ss->speaker;

            return [
                'id'               => $s->id,
                'firstName'        => $s->first_name,
                'lastName'         => $s->last_name,
                'fullName'         => trim("{$s->first_name} {$s->last_name}"),
                'title'            => $s->title,
                'photoUrl'         => $s->photo_url,
                'shortDescription' => $s->short_description,
                'longDescription'  => $s->long_description,
                'dayNumber'        => (int) $dayNumber,
                'masterclassTitle' => $ss->masterclass_title,
                'sortOrder'        => $ss->sort_order,
            ];
        })->values();

        $products = $summit->products->map(function ($p) use ($summit) {
            $price = method_exists($p, 'priceForPhase') ? $p->priceForPhase($summit->current_phase) : null;

            return [
                'id'             => $p->id,
                'name'           => $p->name,
                'description'    => $p->description,
                'amountCents'    => $price?->amount_cents,
                'compareAtCents' => $price?->compare_at_cents,
                'stripePriceId'  => $price?->stripe_price_id,
            ];
        })->values();

        return response()->json([
            'blocks'   => $draft->blocks ?? [],
            'summit'   => [
                'id'            => $summit->id,
                'title'         => $summit->title,
                'description'   => $summit->description,
                'starts_at'     => $summit->starts_at,
                'ends_at'       => $summit->ends_at,
                'current_phase' => $summit->current_phase,
            ],
            'theme'    => $funnel?->theme ?: $this->defaultTheme(),
            'speakers' => $speakers,
            'products' => $products,
            'draft'    => [
                'id'             => $draft->id,
                'version_number' => $draft->version_number,
                'status'         => $draft->status,
            ],
        ]);
    }

    private function defaultTheme(): array
    {
        return [
            'primaryColor'    => '#5e4d9b',
            'accentColor'     => '#00b553',
            'fontHeading'     => 'Inter',
            'fontBody'        => 'Inter',
            'logoUrl'         => null,
            'backgroundStyle' => 'light',
        ];
    }
}
