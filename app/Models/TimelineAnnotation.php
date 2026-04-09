<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class TimelineAnnotation extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'date', 'label', 'annotation_type', 'color',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
