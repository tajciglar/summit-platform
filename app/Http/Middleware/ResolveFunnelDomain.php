<?php

namespace App\Http\Middleware;

use App\Models\Summit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveFunnelDomain
{
    /**
     * Resolve the summit context for funnel routes.
     *
     * For now, summits are resolved via the URL slug pattern:
     *   /{summitSlug}/{funnelSlug}/{stepSlug?}
     *
     * In production with custom domains, this middleware can be
     * extended to map the request host to a summit.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Summit is resolved in the controller via route params for now.
        // This middleware is kept for future custom-domain mapping.
        return $next($request);
    }
}
