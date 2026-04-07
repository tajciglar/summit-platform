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

        return Inertia::render('Funnel/Optin', [
            'funnel' => [
                'name' => $funnel->name,
                'slug' => $funnel->slug,
            ],
            'step' => [
                'title'      => $step->title,
                'slug'       => $step->slug,
                'type'       => $step->type,
                'sort_order' => $step->sort_order,
            ],
        ]);
    }
}
