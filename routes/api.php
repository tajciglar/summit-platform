<?php

use App\Http\Controllers\Api\FunnelResolveController;
use Illuminate\Support\Facades\Route;

Route::get('/funnels/resolve', FunnelResolveController::class)
    ->middleware('throttle:60,1');
