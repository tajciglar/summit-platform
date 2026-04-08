<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'price', 'currency', 'type', 'stripe_price_id', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    /** Price formatted as dollars, e.g. 4700 → "47.00" */
    public function getPriceInDollarsAttribute(): string
    {
        return number_format($this->price / 100, 2);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
