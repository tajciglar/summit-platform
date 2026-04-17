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
        // Shield's RoleResource opts out of tenancy via the plugin config in
        // AdminPanelProvider (FilamentShieldPlugin::make()->scopeToTenant(false)).
        // Do NOT call RoleResource::scopeToTenant(false) here — that assigns
        // to the static property on the base Resource class, which propagates
        // to every resource and breaks domain tenancy across the panel.
    }
}
