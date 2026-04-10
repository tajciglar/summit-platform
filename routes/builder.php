<?php

use App\Http\Controllers\Admin\BuilderController;
use App\Http\Controllers\Admin\BuilderImageController;
use App\Http\Controllers\Admin\FlowController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    // Page Builder (Inertia pages)
    Route::get('/admin/builder/{funnelStep}', [BuilderController::class, 'show'])
        ->name('admin.builder.show');

    Route::get('/admin/flow/{funnel}', [FlowController::class, 'show'])
        ->name('admin.flow.show');

    // Builder API (JSON endpoints)
    Route::post('/admin/api/builder/{funnelStep}', [BuilderController::class, 'save'])
        ->name('admin.builder.save');

    Route::post('/admin/api/builder/upload-image', [BuilderImageController::class, 'upload'])
        ->name('admin.builder.upload');

    Route::post('/admin/api/flow/{funnel}/reorder', [FlowController::class, 'reorder'])
        ->name('admin.flow.reorder');
});
