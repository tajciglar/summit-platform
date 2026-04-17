<?php

namespace App\Providers;

use App\Services\Templates\TemplateRegistry;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StripeClient::class, function () {
            return new StripeClient(config('services.stripe.secret'));
        });

        $this->app->singleton(TemplateRegistry::class);
    }

    public function boot(): void
    {
        // Dynamic Summit navigation items are registered in AdminPanelProvider
        // via ->bootUsing(), since that closure runs once per request after
        // tenant resolution and before the nav manager snapshots panel items.
    }
}
