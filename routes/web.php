<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\FunnelController;
use App\Http\Controllers\OptinController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\UpsellController;
use App\Http\Controllers\VideoAccessController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome');
});

// Stripe webhook — must be outside CSRF middleware, raw body needed
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// Checkout API — called from React via fetch
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/checkout/intent', [CheckoutController::class, 'createIntent']);
    Route::post('/checkout/update-intent', [CheckoutController::class, 'updateIntent']);
    Route::post('/checkout/upsell', [UpsellController::class, 'charge']);
});

Route::post('/optin', [OptinController::class, 'store'])->middleware('throttle:30,1');

// Video access API
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/video/check-access', [VideoAccessController::class, 'check']);
    Route::post('/video/start-watching', [VideoAccessController::class, 'startWatching']);
    Route::post('/video/heartbeat', [VideoAccessController::class, 'heartbeat']);
});

// Builder routes (must be before funnel catch-all)
require __DIR__.'/builder.php';

// Funnel routes — summit-based URL pattern
// /{summitSlug}/{funnelSlug}             → first step
// /{summitSlug}/{funnelSlug}/{stepSlug}  → specific step
Route::middleware('funnel.preview')->group(function () {
    Route::get('/{summitSlug}/{funnelSlug}', [FunnelController::class, 'show']);
    Route::get('/{summitSlug}/{funnelSlug}/{stepSlug}', [FunnelController::class, 'show']);
});
