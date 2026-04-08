<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateCommission extends Model
{
    use HasUuid;

    protected $fillable = [
        'affiliate_id', 'order_id', 'order_item_id',
        'commission_rate', 'order_amount_cents', 'commission_cents',
        'status', 'paid_at',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:4',
        'order_amount_cents' => 'integer',
        'commission_cents' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
