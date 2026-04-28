<?php

use App\Http\Resources\SpeakerResource;
use App\Models\Speaker;
use App\Models\Summit;

it('returns the canonical camelCase speaker shape', function () {
    $summit = Summit::factory()->create(['pre_summit_starts_at' => '2026-05-01']);
    Speaker::factory()->forSummit($summit)->create([
        'first_name' => 'Jane',
        'last_name' => 'Roe',
        'short_bio' => 'short',
        'long_bio' => 'long',
    ]);

    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());

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
        'talkTitle',
        'sortOrder',
        'dayNumber',
    ]);
    expect($array[0]['fullName'])->toBe('Jane Roe');
});

it('reads dayNumber straight from the speaker_summit pivot', function () {
    $summit = Summit::factory()->create(['pre_summit_starts_at' => '2026-05-01']);
    Speaker::factory()->forSummit($summit, day: 5)->create();

    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());

    expect($array[0]['dayNumber'])->toBe(5);
});

it('returns null dayNumber when pivot day_number is unset', function () {
    $summit = Summit::factory()->create(['pre_summit_starts_at' => null]);
    Speaker::factory()->forSummit($summit)->create();

    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());

    expect($array[0]['dayNumber'])->toBeNull();
});

it('exposes per-pivot masterclass and talk titles', function () {
    $summit = Summit::factory()->create();
    Speaker::factory()
        ->forSummit($summit, day: 2, masterclassTitle: 'Sleep & ADHD', talkTitle: 'Quick wins')
        ->create();

    $array = SpeakerResource::collection($summit->speakers()->get())->toArray(request());

    expect($array[0]['masterclassTitle'])->toBe('Sleep & ADHD');
    expect($array[0]['talkTitle'])->toBe('Quick wins');
});
