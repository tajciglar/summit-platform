<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyInternalApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('services.next_app.token');

        if (empty($expected)) {
            abort(500, 'Internal API token not configured');
        }

        $header = $request->header('Authorization', '');
        $provided = str_starts_with($header, 'Bearer ')
            ? substr($header, 7)
            : null;

        if (! $provided || ! hash_equals($expected, $provided)) {
            abort(401, 'Unauthorized');
        }

        return $next($request);
    }
}
