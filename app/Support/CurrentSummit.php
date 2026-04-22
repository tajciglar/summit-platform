<?php

namespace App\Support;

use App\Models\Domain;
use App\Models\Summit;
use Filament\Facades\Filament;

/**
 * Session-stored "current summit" filter. After picking a domain in the top
 * tenant switcher, the admin can optionally pick a summit from the same
 * dropdown menu; that narrows every summit-scoped resource (Funnels,
 * Speakers, Products, Orders, Coupons, Funnel Steps, Order Bumps) to that
 * single summit. Without a pick, resources still filter to the domain but
 * include all of its summits.
 *
 * Storage is a single flat session key. `get()` validates the stored ID
 * against the active domain and self-heals if the user switches domains.
 */
class CurrentSummit
{
    private const KEY = 'current_summit_id';

    public static function get(): ?Summit
    {
        $id = session(self::KEY);
        if (! $id) {
            return null;
        }

        // withoutGlobalScopes: SummitResource registers a global scope that
        // itself reads CurrentSummit, which would recurse forever otherwise.
        $summit = Summit::withoutGlobalScopes()->find($id);
        if (! $summit) {
            self::clear();

            return null;
        }

        // If the summit no longer belongs to the active domain (user switched
        // tenant), drop the filter so they see all summits in the new domain.
        $domain = Filament::getTenant();
        if ($domain instanceof Domain && $summit->domain_id !== $domain->getKey()) {
            self::clear();

            return null;
        }

        return $summit;
    }

    public static function getId(): ?string
    {
        return self::get()?->getKey();
    }

    public static function set(Summit $summit): void
    {
        session()->put(self::KEY, $summit->getKey());
    }

    public static function clear(): void
    {
        session()->forget(self::KEY);
    }
}
