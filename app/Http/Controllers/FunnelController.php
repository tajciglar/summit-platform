<?php

namespace App\Http\Controllers;

use App\Models\FunnelStep;
use App\Models\Summit;
use App\Services\AnalyticsService;
use App\Services\FunnelResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FunnelController extends Controller
{
    public function __construct(
        private readonly FunnelResolver $resolver,
        private readonly AnalyticsService $analytics,
    ) {}

    public function show(Request $request, string $summitSlug, string $funnelSlug, ?string $stepSlug = null): Response
    {
        $summit = $this->resolver->resolveSummit($summitSlug);
        if (! $summit) {
            abort(404);
        }

        $funnel = $this->resolver->resolveFunnel($summit, $funnelSlug);
        if (! $funnel) {
            abort(404);
        }

        $isPreview = $request->attributes->get('funnel_preview', false);
        $step = $this->resolver->resolveStep($funnel, $stepSlug, $isPreview);
        if (! $step) {
            abort(404);
        }

        // Record page view (skip for previews)
        if (! $isPreview) {
            $this->analytics->recordPageView($request, [
                'page_type' => 'funnel_step',
                'summit_id' => $summit->id,
                'funnel_id' => $funnel->id,
                'funnel_step_id' => $step->id,
            ]);
        }

        $summitData = ['id' => $summit->id, 'title' => $summit->title, 'slug' => $summit->slug, 'current_phase' => $summit->current_phase];
        $funnelData = ['id' => $funnel->id, 'name' => $funnel->name, 'slug' => $funnel->slug];
        $stepData = [
            'id' => $step->id,
            'name' => $step->name,
            'slug' => $step->slug,
            'step_type' => $step->step_type,
            'sort_order' => $step->sort_order,
        ];

        $theme = $funnel->theme ?? [];
        $content = $step->content ?? [];
        $template = $step->template;

        $sharedProps = [
            'summit' => $summitData,
            'funnel' => $funnelData,
            'step' => $stepData,
            'template' => $template,
            'content' => $content,
            'theme' => $theme,
            'isPreview' => $isPreview,
        ];

        return match ($step->step_type) {
            'checkout' => $this->renderCheckout($sharedProps, $step, $summit),
            'upsell', 'downsell' => $this->renderUpsell($request, $sharedProps, $step, $summit),
            'thank_you' => Inertia::render('Funnel/ThankYou', $sharedProps),
            default => $this->renderOptin($sharedProps, $step, $summit),
        };
    }

    private function renderOptin(array $props, FunnelStep $step, Summit $summit): Response
    {
        $summit->loadMissing('summitSpeakers.speaker');

        $speakers = $summit->summitSpeakers
            ->map(fn ($ss) => [
                'name' => $ss->speaker->full_name,
                'title' => $ss->speaker->title,
                'bio' => $ss->speaker->short_description,
                'photo_url' => $ss->speaker->photo_url,
                'masterclass_title' => $ss->masterclass_title,
                'is_featured' => $ss->is_featured,
            ])
            ->values()
            ->all();

        return Inertia::render('Funnel/Optin', array_merge($props, [
            'speakers' => $speakers,
        ]));
    }

    private function renderCheckout(array $props, FunnelStep $step, Summit $summit): Response
    {
        $step->loadMissing('product.prices');

        $product = $step->product;
        $price = $product?->priceForPhase($summit->current_phase);

        $nextStep = FunnelStep::where('funnel_id', $step->funnel_id)
            ->where('sort_order', '>', $step->sort_order)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->first();

        // Load order bumps with phase pricing
        $bumps = $step->bumps()->where('is_active', true)->with('product.prices')->get()
            ->map(fn ($bump) => [
                'id' => $bump->id,
                'product_id' => $bump->product_id,
                'headline' => $bump->headline,
                'description' => $bump->description,
                'bullets' => $bump->bullets,
                'checkbox_label' => $bump->checkbox_label,
                'image_url' => $bump->image_url,
                'price_cents' => $bump->product->priceForPhase($summit->current_phase)?->amount_cents ?? 0,
                'compare_at_cents' => $bump->product->priceForPhase($summit->current_phase)?->compare_at_cents,
            ])
            ->values()
            ->all();

        return Inertia::render('Funnel/Checkout', array_merge($props, [
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'price_cents' => $price?->amount_cents ?? 0,
                'compare_at_cents' => $price?->compare_at_cents,
                'currency' => 'USD',
            ] : null,
            'stripeKey' => config('services.stripe.key'),
            'nextStepSlug' => $nextStep?->slug,
            'orderBumps' => $bumps,
        ]));
    }

    private function renderUpsell(Request $request, array $props, FunnelStep $step, Summit $summit): Response
    {
        $step->loadMissing('product.prices');

        $product = $step->product;
        $price = $product?->priceForPhase($summit->current_phase);

        $nextStep = FunnelStep::where('funnel_id', $step->funnel_id)
            ->where('sort_order', '>', $step->sort_order)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->first();

        return Inertia::render('Funnel/Upsell', array_merge($props, [
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'price_cents' => $price?->amount_cents ?? 0,
                'compare_at_cents' => $price?->compare_at_cents,
                'currency' => 'USD',
            ] : null,
            'nextStepSlug' => $nextStep?->slug,
            'paymentIntentId' => session('payment_intent_id'),
        ]));
    }
}
