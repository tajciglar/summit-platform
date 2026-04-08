<?php

use App\Http\Middleware\FunnelPreview;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ResolveFunnelDomain;
use App\Http\Middleware\TrackAffiliateReferral;
use App\Http\Middleware\TrackSessionId;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            TrackSessionId::class,
            TrackAffiliateReferral::class,
        ]);

        $middleware->alias([
            'funnel.domain' => ResolveFunnelDomain::class,
            'funnel.preview' => FunnelPreview::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
