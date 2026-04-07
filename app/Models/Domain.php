<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Domain extends Model
{
    protected $fillable = ['host', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function funnels(): HasMany
    {
        return $this->hasMany(Funnel::class);
    }
}
