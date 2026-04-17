<?php

use App\Http\Controllers\Api\LandingPageDraftController;
use App\Http\Controllers\Api\PublicFunnelController;
use Illuminate\Support\Facades\Route;

Route::get('/funnels/{funnelId}/published-content', [PublicFunnelController::class, 'show']);
Route::get('/landing-page-drafts/{token}', [LandingPageDraftController::class, 'showByToken']);
