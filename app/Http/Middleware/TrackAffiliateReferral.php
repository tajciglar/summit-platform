<?php

namespace App\Http\Middleware;

use App\Models\Affiliate;
use App\Models\AffiliateReferral;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackAffiliateReferral
{
    public function handle(Request $request, Closure $next): Response
    {
        $refCode = $request->query('ref');

        if ($refCode) {
            $affiliate = Affiliate::where('code', $refCode)
                ->where('is_active', true)
                ->first();

            if ($affiliate) {
                // Log the referral click
                AffiliateReferral::create([
                    'affiliate_id' => $affiliate->id,
                    'session_id' => $request->cookie('session_id'),
                    'landing_url' => $request->fullUrl(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'utm_source' => $request->query('utm_source'),
                    'utm_medium' => $request->query('utm_medium'),
                    'utm_campaign' => $request->query('utm_campaign'),
                ]);

                // Set affiliate cookie (90 days)
                $response = $next($request);

                if ($response instanceof Response) {
                    $response->headers->setCookie(
                        cookie('affiliate_ref', $affiliate->id, 60 * 24 * 90) // 90 days
                    );
                }

                return $response;
            }
        }

        return $next($request);
    }
}
