<?php

namespace App\Filament\Resources\Concerns;

use App\Support\CurrentSummit;
use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * For resources whose model has a direct summit() relation but whose Filament
 * tenant is a Domain. Scopes to records whose summit belongs to the current
 * domain, and — when an admin has picked a specific summit in the tenant
 * dropdown — further narrows to that single summit.
 *
 * Use on: Speaker, Product, Funnel, Order, Coupon.
 */
trait ScopesTenantViaSummitDomains
{
    public static function scopeEloquentQueryToTenant(Builder $query, ?Model $tenant): Builder
    {
        $tenant ??= Filament::getTenant();
        if (! $tenant) {
            return $query;
        }

        $query->whereHas(
            'summit.domains',
            fn (Builder $q) => $q->whereKey($tenant->getKey()),
        );

        if ($summitId = CurrentSummit::getId()) {
            $query->where('summit_id', $summitId);
        }

        return $query;
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'summit';
    }

    /**
     * Default Filament behavior fires `summit()->associate($tenant)` on create.
     * Our tenant is a Domain (not a Summit), so that overwrites `summit_id`
     * with the domain's UUID and triggers an FK violation. We keep the read
     * scoping above and rely on the form's `summit_id` default (seeded from
     * CurrentSummit::getId()) to set the correct value on create.
     */
    public static function observeTenancyModelCreation(Panel $panel): void {}
}
