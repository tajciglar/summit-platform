<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(StripeClient::class, function () {
            return new StripeClient(config('services.stripe.secret'));
        });

        $this->app->singleton(\App\Services\Templates\TemplateRegistry::class);

        // (Shield's scopeToTenant is configured via the plugin in AdminPanelProvider.)
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Shield's RoleResource must opt out of Summit tenancy. Roles are global;
        // they have no `summit` relationship. Without this, Filament's
        // BelongsToTenant trait 500s the admin panel on every page render.
        if (class_exists(\BezhanSalleh\FilamentShield\Resources\Roles\RoleResource::class)) {
            \BezhanSalleh\FilamentShield\Resources\Roles\RoleResource::scopeToTenant(false);
        }
    }
}
