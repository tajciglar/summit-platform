<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Canonical speaker shape returned by public + preview + draft APIs.
 *
 * Set `SpeakerResource::$summitStart` to a Carbon instance before building a
 * collection so the resource can derive `dayNumber` for legacy summits where
 * the pivot column is null. Reset to null after use.
 */
class SpeakerResource extends JsonResource
{
    public static ?Carbon $summitStart = null;

    public function toArray(Request $request): array
    {
        $dayNumber = $this->pivot->day_number ?? null;

        if ($dayNumber === null && self::$summitStart && $this->goes_live_at) {
            $dayNumber = (int) (self::$summitStart->diffInDays(Carbon::parse($this->goes_live_at)->startOfDay()) + 1);
        }

        return [
            'id' => $this->id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'fullName' => trim("{$this->first_name} {$this->last_name}"),
            'title' => $this->title,
            'photoUrl' => $this->photo_url,
            'shortBio' => $this->short_bio,
            'longBio' => $this->long_bio,
            'masterclassTitle' => $this->masterclass_title,
            'masterclassDescription' => $this->masterclass_description,
            'rating' => $this->rating,
            'goesLiveAt' => $this->goes_live_at?->toIso8601String(),
            'isFeatured' => (bool) $this->is_featured,
            'sortOrder' => $this->pivot->sort_order ?? 0,
            'dayNumber' => $dayNumber,
        ];
    }
}
