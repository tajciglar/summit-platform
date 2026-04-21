<?php

use App\Http\Controllers\Api\FunnelResolveController;
use App\Http\Controllers\Api\LandingPageDraftController;
use App\Http\Controllers\Api\OptinController;
use App\Http\Controllers\Api\PublicFunnelController;
use Illuminate\Support\Facades\Route;

Route::get('/funnels/{funnelId}/published-content', [PublicFunnelController::class, 'show']);
Route::get('/funnel-steps/{step}/preview-content', [PublicFunnelController::class, 'showStep'])
    ->middleware('throttle:120,1');

Route::get('/funnels/resolve', FunnelResolveController::class)
    ->middleware('throttle:60,1');

// Preview token is the only access control — intentionally no session/bearer auth.
Route::get('/landing-page-drafts/{token}', [LandingPageDraftController::class, 'showByToken'])
    ->middleware('throttle:120,1');

Route::post('/optins', [OptinController::class, 'store'])->middleware('throttle:5,1');
