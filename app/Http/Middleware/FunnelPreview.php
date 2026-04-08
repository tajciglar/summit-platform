<?php

namespace App\Http\Middleware;

use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FunnelPreview
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->query('preview') !== '1') {
            return $next($request);
        }

        // Verify the user is authenticated via Filament's auth guard
        $guard = Filament::auth();

        if (! $guard->check()) {
            abort(403, 'Preview requires admin authentication.');
        }

        $request->attributes->set('funnel_preview', true);

        return $next($request);
    }
}
