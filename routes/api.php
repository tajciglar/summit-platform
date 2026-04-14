<?php

use App\Http\Controllers\Api\CatalogRefreshController;
use App\Http\Controllers\Api\FunnelResolveController;
use Illuminate\Support\Facades\Route;

Route::get('/funnels/resolve', FunnelResolveController::class)
    ->middleware('throttle:60,1');

Route::post('/admin/catalog/refresh', CatalogRefreshController::class)
    ->middleware('throttle:10,1');

// Preview endpoint uses token-as-capability auth: the 40-char random token is the
// only access control. No session/bearer auth is required — this is intentional for
// shareable preview links. Throttled at 120 req/min to limit token-enumeration risk.
Route::get('/landing-page-drafts/{token}', \App\Http\Controllers\Api\LandingPageDraftController::class)
    ->middleware('throttle:120,1');
