<?php

namespace App\Filament\Resources\Concerns;

use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * For resources whose model has a direct summit() relation but whose tenant
 * is actually a Domain. Scopes queries to rows where the record's summit
 * belongs to the current domain.
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

        return $query->whereHas(
            'summit.domains',
            fn (Builder $q) => $q->whereKey($tenant->getKey()),
        );
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        // Record belongs to a Summit directly; Domain attachment happens at
        // the summit level via the domain_summit pivot.
        return 'summit';
    }
}
