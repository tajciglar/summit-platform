<?php

use App\Http\Controllers\Admin\CurrentSummitController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome');
});

// Admin-only: pick or clear the "current summit" filter for the active domain.
// Linked from the tenant-picker dropdown's summit list.
Route::get('/admin/current-summit/{summit}', [CurrentSummitController::class, 'set'])
    ->middleware(['web', 'auth'])
    ->name('admin.current-summit.set');

// V2 customer-facing routes (funnels, checkout, optin, video, stripe webhook)
// will be rebuilt once the Filament admin layer is stable.
