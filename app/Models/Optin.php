<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Optin extends Model
{
    use HasFactory, HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'contact_id', 'user_id', 'email', 'first_name', 'summit_id', 'funnel_id', 'funnel_step_id',
        'source_url', 'ip_address', 'user_agent',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'ac_sync_status', 'ac_sync_error', 'ac_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'ac_synced_at' => 'datetime',
        ];
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
