<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\FunnelStep;
use App\Services\FunnelResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FunnelController extends Controller
{
    public function __construct(private readonly FunnelResolver $resolver) {}

    public function show(Request $request, string $funnelSlug, ?string $stepSlug = null): Response
    {
        /** @var Domain $domain */
        $domain = $request->attributes->get('domain');

        $funnel = $this->resolver->resolveFunnel($domain, $funnelSlug);

        if (! $funnel) {
            abort(404);
        }

        $step = $this->resolver->resolveStep($funnel, $stepSlug);

        if (! $step) {
            abort(404);
        }

        $funnelData = ['name' => $funnel->name, 'slug' => $funnel->slug];
        $stepData = [
            'id' => $step->id,
            'title' => $step->title,
            'slug' => $step->slug,
            'type' => $step->type,
            'sort_order' => $step->sort_order,
            'headline' => $step->headline,
        ];

        return match ($step->type) {
            'checkout' => $this->renderCheckout($funnelData, $stepData, $step),
            'upsell' => $this->renderUpsell($request, $funnelData, $stepData, $step),
            'thank_you' => Inertia::render('Funnel/ThankYou', ['funnel' => $funnelData, 'step' => $stepData]),
            default => $this->renderOptin($funnelData, $stepData, $step),
        };
    }

    private function renderOptin(array $funnelData, array $stepData, FunnelStep $step): Response
    {
        $funnel = $step->funnel;
        $funnel->loadMissing('speakers');

        $speakers = $funnel->speakers
            ->filter(fn ($s) => $s->is_active)
            ->map(fn ($s) => [
                'name' => $s->name,
                'title' => $s->title,
                'bio' => $s->bio,
                'photo_url' => $s->getFirstMediaUrl('photo'),
            ])
            ->values()
            ->all();

        return Inertia::render('Funnel/Optin', [
            'funnel' => $funnelData,
            'step' => $stepData,
            'speakers' => $speakers,
        ]);
    }

    private function renderCheckout(array $funnelData, array $stepData, FunnelStep $step): Response
    {
        $step->loadMissing('product');

        $nextStep = FunnelStep::where('funnel_id', $step->funnel_id)
            ->where('sort_order', '>', $step->sort_order)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->first();

        return Inertia::render('Funnel/Checkout', [
            'funnel' => $funnelData,
            'step' => $stepData,
            'product' => $step->product ? [
                'name' => $step->product->name,
                'price_in_dollars' => $step->product->price_in_dollars,
                'currency' => $step->product->currency,
            ] : null,
            'stripeKey' => config('services.stripe.key'),
            'nextStepSlug' => $nextStep?->slug,
        ]);
    }

    private function renderUpsell(Request $request, array $funnelData, array $stepData, FunnelStep $step): Response
    {
        $step->loadMissing('product');

        // Find the next step after this upsell (for skip/decline navigation)
        $nextStep = FunnelStep::where('funnel_id', $step->funnel_id)
            ->where('sort_order', '>', $step->sort_order)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->first();

        return Inertia::render('Funnel/Upsell', [
            'funnel' => $funnelData,
            'step' => $stepData,
            'product' => $step->product ? [
                'name' => $step->product->name,
                'price_in_dollars' => $step->product->price_in_dollars,
                'currency' => $step->product->currency,
            ] : null,
            'nextStepSlug' => $nextStep?->slug,
            'paymentIntentId' => session('payment_intent_id'),
        ]);
    }
}
