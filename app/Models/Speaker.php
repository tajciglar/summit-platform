<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Speaker extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = ['name', 'title', 'bio', 'website_url', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function funnels(): BelongsToMany
    {
        return $this->belongsToMany(Funnel::class)->withPivot('sort_order')->orderByPivot('sort_order');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')->singleFile();
    }
}
