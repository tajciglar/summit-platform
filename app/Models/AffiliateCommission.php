<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateCommission extends Model
{
    use HasUuid;

    protected $fillable = [
        'affiliate_id',
        'order_id',
        'commission_rate',
        'order_amount_cents',
        'commission_cents',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:4',
            'paid_at' => 'datetime',
        ];
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
