<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Support\Facades\Gate;
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
        // Admins bypass all policy checks — permissions are used for non-admin
        // roles only. Returning true (not null) short-circuits every gate check.
        Gate::before(function (User $user) {
            if ($user->role === 'admin') {
                return true;
            }
        });

        // Dynamic Summit navigation items are registered in AdminPanelProvider
        // via ->bootUsing(), since that closure runs once per request after
        // tenant resolution and before the nav manager snapshots panel items.
    }
}
