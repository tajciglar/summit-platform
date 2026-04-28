<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Contact extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'country',
        'ac_contact_id',
    ];

    public function optins(): HasMany
    {
        return $this->hasMany(Optin::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Distinct summits this contact is attached to (resolved via optins).
     *
     * @return Collection<int, Summit>
     */
    public function summits()
    {
        return Summit::query()
            ->whereIn('id', $this->optins()->whereNotNull('summit_id')->pluck('summit_id')->unique())
            ->get();
    }

    /**
     * Total revenue (in cents) from completed / partial-refund orders.
     */
    public function getPaidRevenueCentsAttribute(): int
    {
        return (int) $this->orders()
            ->whereIn('status', ['completed', 'partial_refund'])
            ->sum('total_cents');
    }
}
