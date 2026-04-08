<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackSessionId
{
    /**
     * Ensure every visitor has a persistent session_id cookie.
     * This threads through page_views, video_views, optins, and affiliate_referrals.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionId = $request->cookie('session_id');

        if (! $sessionId) {
            $sessionId = (string) Str::uuid();
        }

        // Make it available to downstream code
        $request->attributes->set('tracking_session_id', $sessionId);

        $response = $next($request);

        // Set cookie if not already present (365 days)
        if (! $request->cookie('session_id') && $response instanceof Response) {
            $response->headers->setCookie(
                cookie('session_id', $sessionId, 60 * 24 * 365)
            );
        }

        return $response;
    }
}
