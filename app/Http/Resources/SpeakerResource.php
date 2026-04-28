<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Canonical speaker shape returned by public + preview + draft APIs.
 *
 * After the 2026-04-28 admin refactor (Area 4) `goes_live_at` and
 * `is_featured` no longer exist on the speakers table. `masterclass_title`
 * has moved to the `speaker_summit` pivot, joined by a per-summit
 * `talk_title`. `dayNumber` is read straight from the pivot.
 */
class SpeakerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'fullName' => trim("{$this->first_name} {$this->last_name}"),
            'title' => $this->title,
            'photoUrl' => $this->photo_url,
            'shortBio' => $this->short_bio,
            'longBio' => $this->long_bio,
            'masterclassTitle' => $this->pivot->masterclass_title ?? null,
            'masterclassDescription' => $this->masterclass_description,
            'talkTitle' => $this->pivot->talk_title ?? null,
            'sortOrder' => $this->pivot->sort_order ?? 0,
            'dayNumber' => $this->pivot->day_number ?? null,
        ];
    }
}
