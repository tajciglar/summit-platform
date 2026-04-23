<?php

use App\Http\Controllers\Api\CheckoutPrefillController;
use App\Http\Controllers\Api\FunnelResolveController;
use App\Http\Controllers\Api\LandingPageDraftController;
use App\Http\Controllers\Api\OptinController;
use App\Http\Controllers\Api\PublicFunnelController;
use App\Http\Controllers\Api\TrackPageViewController;
use Illuminate\Support\Facades\Route;

// Server-to-server endpoints (called by Next.js with INTERNAL_API_TOKEN).
Route::middleware('internal-api')->group(function () {
    Route::get('/funnels/{funnelId}/published-content', [PublicFunnelController::class, 'show']);
    Route::get('/funnel-steps/{step}/preview-content', [PublicFunnelController::class, 'showStep'])
        ->middleware('throttle:120,1');
    Route::get('/funnels/resolve', FunnelResolveController::class)
        ->middleware('throttle:60,1');
    Route::get('/funnels/resolve-by-host', [PublicFunnelController::class, 'resolveByHost'])
        ->middleware('throttle:120,1');
    Route::get('/optin/prefill/{token}', [CheckoutPrefillController::class, 'show'])
        ->middleware('throttle:60,1');
});

// Public endpoints — access control baked in (preview token / throttle / browser-origin).
Route::get('/landing-page-drafts/{token}', [LandingPageDraftController::class, 'showByToken'])
    ->middleware('throttle:120,1');

Route::post('/optins', [OptinController::class, 'store'])->middleware('throttle:5,1');

Route::post('/track/page-view', TrackPageViewController::class)
    ->middleware('throttle:120,1');
