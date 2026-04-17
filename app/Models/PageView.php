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
        'visitor_session_id',
        'user_id',
        'summit_id',
        'funnel_id',
        'funnel_step_id',
        'page_url',
        'page_type',
        'referrer_url',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'ip_address',
        'user_agent',
        'country_code',
        'device_type',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function visitorSession(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
