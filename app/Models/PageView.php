<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageView extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'session_id', 'user_id', 'page_url', 'page_type',
        'summit_id', 'funnel_id', 'funnel_step_id', 'referrer_url',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'ip_address', 'user_agent', 'country_code', 'device_type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }
}
