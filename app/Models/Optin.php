<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Optin extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'contact_id', 'user_id', 'email', 'first_name', 'summit_id', 'funnel_id', 'funnel_step_id',
        'source_url', 'ip_address', 'user_agent',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'activecampaign_synced',
    ];

    protected $casts = [
        'activecampaign_synced' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
