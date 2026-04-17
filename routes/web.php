<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome');
});

// V2 customer-facing routes (funnels, checkout, optin, video, stripe webhook)
// will be rebuilt once the Filament admin layer is stable.
