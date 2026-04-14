<?php

/*
 * CORS for the headless funnel API consumed by the Next.js renderer on Vercel.
 *
 * Dev: localhost:3000 (pnpm dev).
 * Staging/prod: the Vercel-assigned domain(s) listed via CORS_ALLOWED_ORIGINS
 * so we don't have to ship a new container every time we add a preview URL.
 */

$envOrigins = array_filter(
    array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', ''))),
    fn ($o) => $o !== ''
);

$defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_merge($defaults, $envOrigins))),

    // Allow any Vercel preview deployment for the project when VERCEL_PROJECT_SLUG is set.
    'allowed_origins_patterns' => array_values(array_filter([
        env('VERCEL_PROJECT_SLUG')
            ? '#^https://'.preg_quote(env('VERCEL_PROJECT_SLUG'), '#').'-[a-z0-9-]+\.vercel\.app$#'
            : null,
    ])),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
