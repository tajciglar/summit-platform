<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistTemplateItem extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'template_id', 'category', 'name', 'page_type', 'sort_order', 'default_tags', 'notes',
    ];

    protected $casts = [
        'default_tags' => 'array',
        'sort_order' => 'integer',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(SummitChecklistTemplate::class, 'template_id');
    }
}
