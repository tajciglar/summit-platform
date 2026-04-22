<?php

namespace App\Models;

use App\Models\Concerns\HasMediaAttachments;
use App\Models\Concerns\HasUuid;
use Filament\Models\Contracts\HasName;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Filament tenant. A domain represents a public-facing brand / website
 * (parenting-summits.com, vzgoja.si, althea-academy.com). Admins are scoped
 * to one or more domains; picking a domain in the top-right tenant switcher
 * filters every downstream resource (summits, funnels, products, orders, etc.)
 * to the set of summits that domain hosts.
 */
class Domain extends Model implements HasName
{
    use HasFactory, HasMediaAttachments, HasUuid;

    protected $fillable = [
        'name',
        'hostname',
        'slug',
        'brand_color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getFilamentName(): string
    {
        return $this->name ?: $this->hostname ?: 'Untitled domain';
    }

    public function summits(): HasMany
    {
        return $this->hasMany(Summit::class)->orderBy('title');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'domain_user')
            ->withPivot('created_at');
    }
}
