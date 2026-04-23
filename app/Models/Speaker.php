<?php

namespace App\Models;

use App\Models\Concerns\HasMediaAttachments;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Speaker extends Model
{
    use HasFactory, HasMediaAttachments, HasUuid;

    protected $fillable = [
        'slug',
        'first_name',
        'last_name',
        'email',
        'photo_url',
        'title',
        'short_bio',
        'long_bio',
        'website_url',
        'social_links',
        'masterclass_title',
        'masterclass_description',
        'rating',
        'free_video_url',
        'vip_video_url',
        'goes_live_at',
        'sort_order',
        'is_featured',
        'free_access_window_hours',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'goes_live_at' => 'datetime',
            'is_featured' => 'boolean',
            'rating' => 'integer',
            'sort_order' => 'integer',
            'free_access_window_hours' => 'integer',
        ];
    }

    /**
     * Summits this speaker is attached to. The pivot carries per-summit
     * `day_number` and `sort_order`, so a reused speaker video can sit on
     * Day 2 of one summit and Day 5 of another.
     */
    public function summits(): BelongsToMany
    {
        return $this->belongsToMany(Summit::class, 'speaker_summit')
            ->withPivot('day_number', 'sort_order')
            ->withTimestamps()
            ->using(SpeakerSummit::class);
    }

    /**
     * Direct HasMany to the pivot rows — used by the Filament Speaker form's
     * Repeater so each attachment's `day_number` is an editable per-row
     * control. For read paths prefer `summits()` and `$speaker->pivot`.
     */
    public function speakerSummits(): HasMany
    {
        return $this->hasMany(SpeakerSummit::class);
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn ($value) => $this->imageUrl('photo') ?: $value);
    }
}
