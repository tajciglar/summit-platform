<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SummitPage extends Model
{
    use HasUuid;

    protected $fillable = ['summit_id', 'slug', 'title', 'content', 'sort_order', 'is_published'];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }
}
