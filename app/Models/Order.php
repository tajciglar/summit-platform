<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasUuid;

    protected $fillable = [
        'order_number',
        'user_id',
        'summit_id',
        'visitor_session_id',
        'funnel_id',
        'funnel_step_id',
        'phase_at_purchase',
        'status',
        'subtotal_cents',
        'discount_cents',
        'tax_cents',
        'total_cents',
        'currency',
        'items',
        'coupon_id',
        'affiliate_id',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'stripe_subscription_id',
        'subscription_status',
        'subscription_period_end',
        'subscription_canceled_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'completed_at' => 'datetime',
            'subscription_period_end' => 'datetime',
            'subscription_canceled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function visitorSession(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class);
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function paymentEvents(): HasMany
    {
        return $this->hasMany(PaymentEvent::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function isSubscription(): bool
    {
        return $this->stripe_subscription_id !== null;
    }
}
