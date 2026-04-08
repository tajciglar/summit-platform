<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateReferral extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'affiliate_id', 'session_id', 'landing_url',
        'ip_address', 'user_agent', 'utm_source', 'utm_medium', 'utm_campaign',
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }
}
