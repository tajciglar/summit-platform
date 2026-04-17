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
        'funnel_id', 'summit_id', 'email', 'first_name',
        'utm_source', 'utm_medium', 'utm_campaign',
        'referrer', 'user_agent', 'ip_address',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }
}
