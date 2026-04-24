<?php

use App\Http\Resources\SpeakerResource;
use App\Models\Speaker;
use App\Models\Summit;
use Carbon\Carbon;

it('returns the canonical camelCase speaker shape', function () {
    $summit = Summit::factory()->create(['pre_summit_starts_at' => '2026-05-01']);
    Speaker::factory()->forSummit($summit)->create([
        'first_name' => 'Jane',
        'last_name' => 'Roe',
        'short_bio' => 'short',
        'long_bio' => 'long',
    ]);

    SpeakerResource::$summitStart = Carbon::parse('2026-05-01')->startOfDay();
    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());
    SpeakerResource::$summitStart = null;

    expect($array)->toHaveCount(1);
    expect(array_keys($array[0]))->toEqualCanonicalizing([
        'id',
        'firstName',
        'lastName',
        'fullName',
        'title',
        'photoUrl',
        'shortBio',
        'longBio',
        'masterclassTitle',
        'masterclassDescription',
        'goesLiveAt',
        'isFeatured',
        'sortOrder',
        'dayNumber',
    ]);
    expect($array[0]['fullName'])->toBe('Jane Roe');
});

it('prefers pivot day_number over goes_live_at derivation', function () {
    $summit = Summit::factory()->create(['pre_summit_starts_at' => '2026-05-01']);
    Speaker::factory()->forSummit($summit, day: 5)->create([
        'goes_live_at' => '2026-05-03 00:00:00',
    ]);

    SpeakerResource::$summitStart = Carbon::parse($summit->pre_summit_starts_at)->startOfDay();
    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());
    SpeakerResource::$summitStart = null;

    expect($array[0]['dayNumber'])->toBe(5);
});

it('returns null dayNumber when pivot and summitStart are both absent', function () {
    $summit = Summit::factory()->create(['pre_summit_starts_at' => null]);
    Speaker::factory()->forSummit($summit)->create(['goes_live_at' => null]);

    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());

    expect($array[0]['dayNumber'])->toBeNull();
});
