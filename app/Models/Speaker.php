<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Speaker extends Model
{
    use HasUuid;

    protected $fillable = [
        'slug', 'first_name', 'last_name', 'email', 'photo_url',
        'title', 'short_description', 'long_description',
        'website_url', 'social_links',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    public function summitSpeakers(): HasMany
    {
        return $this->hasMany(SummitSpeaker::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
