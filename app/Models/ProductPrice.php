<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPrice extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'product_id', 'summit_phase', 'amount_cents', 'compare_at_cents', 'stripe_price_id',
    ];

    protected $casts = [
        'amount_cents' => 'integer',
        'compare_at_cents' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getAmountInDollarsAttribute(): string
    {
        return number_format($this->amount_cents / 100, 2);
    }
}
