<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
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

        // Raise Livewire's default upload cap (12 MB) to match PHP limits
        // configured in composer dev (50 MB). Stock images can easily exceed
        // the default and produce a bare 422 with no visible error for the user.
        Config::set('livewire.temporary_file_upload.rules', ['required', 'file', 'max:51200']);

        // Railway terminates TLS at the edge and forwards HTTP to the container.
        // Trusting X-Forwarded-Proto in bootstrap/app.php handles most URL
        // generation, but Livewire's signed upload URL is built before middleware
        // runs in some paths — forcing the scheme here is the reliable fix.
        //
        // NOTE: env() returns null once `config:cache` has run, so we pivot on
        // APP_ENV (which IS baked into the cache as config('app.env')).
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
