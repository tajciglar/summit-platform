<?php

namespace App\Filament\Resources\Concerns;

use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait ScopesTenantViaDomainId
{
    public static function scopeEloquentQueryToTenant(Builder $query, ?Model $tenant): Builder
    {
        $tenant ??= Filament::getTenant();
        if (! $tenant) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($tenant) {
            $q->where('domain_id', $tenant->getKey())->orWhereNull('domain_id');
        });
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'domain';
    }

    public static function observeTenancyModelCreation(Panel $panel): void {}
}
