<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Order extends Model
{
    protected $fillable = [
        'product_id', 'funnel_step_id', 'customer_email', 'customer_name',
        'amount', 'bumps_total', 'currency', 'status', 'stripe_payment_intent_id', 'stripe_customer_id',
    ];

    protected $casts = [
        'amount' => 'integer',
        'bumps_total' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function orderBumps(): BelongsToMany
    {
        return $this->belongsToMany(OrderBump::class, 'order_bump_order')
            ->withPivot('amount')
            ->withTimestamps();
    }
}
