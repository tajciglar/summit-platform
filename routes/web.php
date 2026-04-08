<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\FunnelController;
use App\Http\Controllers\OptinController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\UpsellController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome');
});

// Stripe webhook — must be outside CSRF middleware, raw body needed
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

// Checkout API — called from React via fetch
Route::post('/checkout/intent', [CheckoutController::class, 'createIntent']);
Route::post('/checkout/update-intent', [CheckoutController::class, 'updateIntent']);
Route::post('/checkout/upsell', [UpsellController::class, 'charge']);
Route::post('/optin', [OptinController::class, 'store']);

// Funnel routes — domain resolved by middleware
Route::middleware('funnel.domain')->group(function () {
    // /{funnel-slug}           → first step (optin)
    // /{funnel-slug}/{step-slug} → specific step
    Route::get('/{funnelSlug}', [FunnelController::class, 'show']);
    Route::get('/{funnelSlug}/{stepSlug}', [FunnelController::class, 'show']);
});
