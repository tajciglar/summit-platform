<?php

namespace App\Providers\Filament;

use App\Filament\Resources\Domains\DomainResource;
use App\Filament\Resources\Summits\SummitResource;
use App\Models\Domain;
use App\Support\CurrentSummit;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\MenuItem;
use Filament\Navigation\NavigationGroup;
use Filament\Navigation\NavigationItem;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->viteTheme('resources/css/filament/admin/theme.css')
            ->brandName('Summit Builder')
            ->login()
            ->colors([
                'primary' => Color::Indigo,
                'gray' => Color::Slate,
                'success' => Color::Emerald,
                'warning' => Color::Amber,
                'danger' => Color::Rose,
                'info' => Color::Sky,
            ])
            ->sidebarCollapsibleOnDesktop()
            ->sidebarWidth('15rem')
            ->collapsedSidebarWidth('4rem')
            ->tenant(Domain::class, slugAttribute: 'slug')
            ->tenantMenu()
            // Tenant dropdown = domain switcher + domain management.
            // Summit picker lives as its own card at the top of the sidebar
            // (rendered via SIDEBAR_NAV_START hook in AppServiceProvider).
            ->tenantMenuItems([
                MenuItem::make()
                    ->label('Manage domains')
                    ->icon('heroicon-o-globe-alt')
                    ->url(fn (): string => DomainResource::getUrl('index')),
                MenuItem::make()
                    ->label('Manage summits')
                    ->icon('heroicon-o-squares-2x2')
                    ->url(fn (): string => SummitResource::getUrl('index')),
            ])
            ->navigationGroups([
                // Summit group goes first; items are injected per-request in
                // AppServiceProvider based on the current domain's summits.
                NavigationGroup::make('Summit')
                    ->icon('heroicon-o-calendar-days')
                    ->collapsible(false),
                NavigationGroup::make('Content')
                    ->icon('heroicon-o-sparkles')
                    ->collapsible(false),
                NavigationGroup::make('Funnels')
                    ->icon('heroicon-o-funnel')
                    ->collapsible(false),
                NavigationGroup::make('Sales')
                    ->icon('heroicon-o-banknotes')
                    ->collapsible(false),
                NavigationGroup::make('Analytics')
                    ->icon('heroicon-o-chart-bar-square')
                    ->collapsible(false),
                NavigationGroup::make('Settings')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->collapsed(),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->plugins([
                // Roles are a global concept — don't scope them to the current summit.
                FilamentShieldPlugin::make()->scopeToTenant(false),
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            // Inject one Summit nav item per summit available on the active
            // domain. Runs once per request after the panel (and tenant) boots.
            // Panel boot runs before tenant resolution, so we parse the
            // {tenant} slug out of the incoming URL ourselves. This registers
            // one Summit nav item per summit on the active domain.
            ->bootUsing(function (Panel $panel): void {
                $path = trim(request()->path(), '/');          // admin/althea-academy/...
                $segments = explode('/', $path);                // ['admin', 'althea-academy', ...]
                $tenantSlug = $segments[1] ?? null;
                if (! $tenantSlug || $tenantSlug === 'login') {
                    return;
                }

                $domain = Domain::where('slug', $tenantSlug)->first();
                if (! $domain) {
                    return;
                }

                $summits = $domain->summits()
                    ->withoutGlobalScopes()
                    ->orderBy('title')
                    ->get();
                if ($summits->isEmpty()) {
                    return;
                }

                // isActiveWhen runs at render time, so it correctly sees the
                // session (panel boot runs BEFORE StartSession middleware).
                $items = [];
                $sort = 0;
                foreach ($summits as $summit) {
                    $summitId = $summit->id;
                    $items[] = NavigationItem::make($summit->title)
                        ->group('Summit')
                        ->sort($sort++)
                        ->url(route('admin.current-summit.set', ['summit' => $summit->id]))
                        ->isActiveWhen(fn (): bool => $summitId === CurrentSummit::getId());
                }

                // "+ New summit" sits at the bottom of the group. No icon —
                // Filament errors if group AND item both have icons.
                $items[] = NavigationItem::make('+ New summit')
                    ->group('Summit')
                    ->sort(999)
                    ->url(fn (): string => SummitResource::getUrl('create'));

                $panel->navigationItems($items);
            });
    }
}
