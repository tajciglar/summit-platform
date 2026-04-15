<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'activecampaign' => [
        'url' => env('AC_API_URL'),
        'key' => env('AC_API_KEY'),
        'optin_tag_id' => env('AC_OPTIN_TAG_ID'),
        'product_tag_id' => env('AC_PRODUCT_TAG_ID'),
    ],

    'brevo' => [
        'api_key' => env('BREVO_API_KEY'),
        'from_email' => env('BREVO_FROM_EMAIL', 'noreply@example.com'),
        'from_name' => env('BREVO_FROM_NAME', env('APP_NAME', 'Summit Platform')),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'funnelforge' => [
        'url' => env('FUNNELFORGE_URL', 'http://localhost:3333'),
        'timeout' => (int) env('FUNNELFORGE_TIMEOUT', 120),
    ],

    'next_app' => [
        'url' => env('NEXT_APP_URL', 'http://localhost:3000'),
        'token' => env('INTERNAL_API_TOKEN'),
    ],

];
