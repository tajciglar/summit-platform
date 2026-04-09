<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SummitChecklistTemplate extends Model
{
    use HasUuid;

    protected $fillable = [
        'name', 'description', 'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ChecklistTemplateItem::class, 'template_id')->orderBy('sort_order');
    }
}
