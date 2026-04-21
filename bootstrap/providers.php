<?php

use App\Providers\AppServiceProvider;
use App\Providers\BunnyStorageServiceProvider;
use App\Providers\Filament\AdminPanelProvider;

return [
    AppServiceProvider::class,
    BunnyStorageServiceProvider::class,
    AdminPanelProvider::class,
];
