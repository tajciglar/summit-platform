<?php

namespace App\Providers\Filament;

use App\Filament\Resources\Domains\DomainResource;
use App\Filament\Resources\Summits\SummitResource;
use App\Models\Domain;
use App\Support\CurrentSummit;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Filament\Auth\MultiFactor\App\AppAuthentication;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\MenuItem;
use Filament\Navigation\NavigationGroup;
use Filament\Navigation\NavigationItem;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\HtmlString;
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
            // Opt-in TOTP (Google Authenticator / 1Password / etc.) with
            // recovery codes. Users enable it from their profile page. The
            // built-in Filament login form handles the "enter the 6-digit
            // code" challenge once a secret is set.
            ->multiFactorAuthentication([
                AppAuthentication::make()->recoverable(),
            ])
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
                NavigationGroup::make('CRM')
                    ->icon('heroicon-o-user-group')
                    ->collapsible(false),
                NavigationGroup::make('Analytics')
                    ->icon('heroicon-o-chart-bar-square')
                    ->collapsible(false),
                NavigationGroup::make('Admin')
                    ->icon('heroicon-o-shield-check')
                    ->collapsed(),
                NavigationGroup::make('Settings')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->collapsed(),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([])
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
            // Warn-on-navigate for unsaved form changes. Tracks dirty state on
            // any input inside a Filament form; clears it when a Save/Create/
            // Update button is clicked or a form is submitted. The native
            // beforeunload prompt catches tab-close, back, and sidebar clicks.
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn (): HtmlString => new HtmlString(<<<'HTML'
<script>
(function () {
    let dirty = false;
    const FORM_SEL = '.fi-form, form[wire\\:submit], form[wire\\:submit\\.prevent]';
    const SAVE_LABELS = ['save', 'save changes', 'save & close', 'create', 'update'];

    document.addEventListener('input', (e) => {
        const t = e.target;
        if (!t) return;
        if (t.matches && t.matches('input, textarea, select, [contenteditable="true"]') && t.closest(FORM_SEL)) {
            dirty = true;
        }
    }, true);

    document.addEventListener('submit', () => { dirty = false; }, true);

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a');
        if (!btn) return;
        const label = (btn.textContent || '').trim().toLowerCase();
        if (SAVE_LABELS.includes(label)) dirty = false;
    }, true);

    window.addEventListener('beforeunload', (e) => {
        if (!dirty) return;
        e.preventDefault();
        e.returnValue = '';
    });
})();
</script>
HTML),
            )
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

                // Live summits only: event hasn't ended yet (or end date unknown).
                $summits = $domain->summits()
                    ->withoutGlobalScopes()
                    ->where(function ($q): void {
                        $q->whereNull('ends_at')
                            ->orWhere('ends_at', '>=', now());
                    })
                    ->orderBy('title')
                    ->get();

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

                $items[] = NavigationItem::make('Manage summits')
                    ->group('Summit')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->sort(998)
                    ->url(fn (): string => SummitResource::getUrl('index'));

                $panel->navigationItems($items);
            });
    }
}
