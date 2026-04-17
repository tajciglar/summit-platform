<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser, HasName
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

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function videoViewSessions(): HasMany
    {
        return $this->hasMany(VideoViewSession::class);
    }
}
