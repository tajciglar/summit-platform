<?php

namespace App\Http\Middleware;

use App\Models\Domain;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveFunnelDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();

        $domain = Domain::where('host', $host)
            ->where('is_active', true)
            ->first();

        if (! $domain) {
            abort(404);
        }

        // Make the resolved domain available to downstream controllers/services
        $request->attributes->set('domain', $domain);

        return $next($request);
    }
}
