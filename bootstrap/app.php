<?php

use App\Http\Middleware\VerifyInternalApiToken;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'internal-api' => VerifyInternalApiToken::class,
        ]);

        // Railway (and most PaaS) terminate TLS at the edge and forward
        // plain HTTP to the container. Trusting all proxies means Laravel
        // honors X-Forwarded-Proto: https when deciding request scheme.
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
