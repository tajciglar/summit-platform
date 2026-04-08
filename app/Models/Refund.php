<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'order_id', 'amount_cents', 'reason', 'reason_detail',
        'stripe_refund_id', 'refunded_by',
    ];

    protected $casts = [
        'amount_cents' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function refundedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }
}
