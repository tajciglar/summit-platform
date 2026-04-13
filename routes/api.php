<?php

use App\Http\Controllers\Api\CatalogRefreshController;
use App\Http\Controllers\Api\FunnelResolveController;
use Illuminate\Support\Facades\Route;

Route::get('/funnels/resolve', FunnelResolveController::class)
    ->middleware('throttle:60,1');

Route::post('/admin/catalog/refresh', CatalogRefreshController::class)
    ->middleware('throttle:10,1');
