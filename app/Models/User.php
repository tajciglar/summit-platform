<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser, HasName, HasTenants
{
    use HasFactory, HasRoles, HasUuid, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'first_name',
        'last_name',
        'role',
        'stripe_customer_id',
        'activecampaign_id',
        'phone',
        'country',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin' && $this->is_active;
    }

    public function getFilamentName(): string
    {
        return trim(($this->first_name ?? '').' '.($this->last_name ?? '')) ?: $this->email;
    }

    /**
     * Summits this admin can directly access (legacy — tenancy is Domain
     * now; kept for back-compat where other code still expects it).
     */
    public function summits(): BelongsToMany
    {
        return $this->belongsToMany(Summit::class, 'summit_user')->withPivot('created_at');
    }

    /**
     * Domains this admin can operate on. Filament tenancy driver.
     */
    public function domains(): BelongsToMany
    {
        return $this->belongsToMany(Domain::class, 'domain_user')->withPivot('created_at');
    }

    /**
     * Filament tenancy: which tenants (Domains) this user can access.
     * Super admins see every domain automatically.
     */
    public function getTenants(Panel $panel): Collection
    {
        if ($this->hasRole('super_admin')) {
            return Domain::query()->orderBy('name')->get();
        }

        return $this->domains()->orderBy('name')->get();
    }

    public function canAccessTenant(Model $tenant): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        return $this->domains()->whereKey($tenant->getKey())->exists();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function videoViewSessions(): HasMany
    {
        return $this->hasMany(VideoViewSession::class);
    }
}
