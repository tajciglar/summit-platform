<?php

use App\Filament\Resources\Concerns\ScopesTenantViaDomainId;
use App\Models\Domain;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns query untouched when no tenant', function () {
    $resource = new class
    {
        use ScopesTenantViaDomainId;
    };

    $a = Domain::factory()->create();
    Summit::factory()->create(['domain_id' => $a->id]);
    Summit::factory()->create(['domain_id' => Domain::factory()->create()->id]);

    $query = Summit::query();
    $resource::scopeEloquentQueryToTenant($query, null);

    expect($query->count())->toBe(2);
});

it('scopes to tenant plus globals when tenant given', function () {
    $resource = new class
    {
        use ScopesTenantViaDomainId;
    };

    $a = Domain::factory()->create();
    $b = Domain::factory()->create();
    Summit::factory()->create(['domain_id' => $a->id]);
    Summit::factory()->create(['domain_id' => $b->id]);

    $query = Summit::query();
    $resource::scopeEloquentQueryToTenant($query, $a);

    expect($query->count())->toBe(1);
});
