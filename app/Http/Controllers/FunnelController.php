<?php

namespace App\Http\Controllers;

use App\Models\Domain;
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
        $stepData   = [
            'id'         => $step->id,
            'title'      => $step->title,
            'slug'       => $step->slug,
            'type'       => $step->type,
            'sort_order' => $step->sort_order,
            'headline'   => $step->headline,
        ];

        if ($step->type === 'checkout') {
            $step->loadMissing('product');

            return Inertia::render('Funnel/Checkout', [
                'funnel'    => $funnelData,
                'step'      => $stepData,
                'product'   => $step->product ? [
                    'name'             => $step->product->name,
                    'price_in_dollars' => $step->product->price_in_dollars,
                    'currency'         => $step->product->currency,
                ] : null,
                'stripeKey' => config('services.stripe.key'),
            ]);
        }

        $component = match ($step->type) {
            'thank_you' => 'Funnel/ThankYou',
            default     => 'Funnel/Optin',
        };

        return Inertia::render($component, [
            'funnel' => $funnelData,
            'step'   => $stepData,
        ]);
    }
}
