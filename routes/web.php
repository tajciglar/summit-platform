<?php

use App\Http\Controllers\FunnelController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome');
});

// Funnel routes — domain resolved by middleware
Route::middleware('funnel.domain')->group(function () {
    // /{funnel-slug}           → first step (optin)
    // /{funnel-slug}/{step-slug} → specific step
    Route::get('/{funnelSlug}', [FunnelController::class, 'show']);
    Route::get('/{funnelSlug}/{stepSlug}', [FunnelController::class, 'show']);
});
