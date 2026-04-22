<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Pivot row between Speaker and Summit. Carries per-attachment `day_number`
 * and `sort_order` so one Speaker (a reusable video) can be on Summit A
 * as Day 2 and Summit B as Day 5.
 *
 * Modeled as an Eloquent pivot so Filament's Repeater component can bind
 * to `Speaker::speakerSummits()` (HasMany) and expose the pivot fields
 * as per-row form controls — belongsToMany alone doesn't give Repeater
 * the per-row state it needs.
 */
class SpeakerSummit extends Pivot
{
    use HasUuid;

    protected $table = 'speaker_summit';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = [
        'speaker_id',
        'summit_id',
        'day_number',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'day_number' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }
}
