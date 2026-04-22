<?php

use App\Models\Speaker;
use App\Models\Summit;
use App\Services\Templates\SectionPlaceholderFiller;

beforeEach(function () {
    $this->filler = new SectionPlaceholderFiller;
    $this->summit = Summit::factory()->create();
});

/** Shape mirrors ochre-ink's `speakersByDay` in next-app/public/template-manifest.json. */
function byDaySectionSchema(): array
{
    return [
        'type' => 'object',
        'required' => ['speakersByDay'],
        'properties' => [
            'speakersByDay' => [
                'type' => 'array',
                'minItems' => 1,
                'items' => [
                    'type' => 'object',
                    'required' => ['dayLabel', 'dayDate', 'speakerIds'],
                    'properties' => [
                        'dayLabel' => ['type' => 'string', 'minLength' => 1],
                        'dayDate' => ['type' => 'string', 'format' => 'date'],
                        'speakerIds' => [
                            'type' => 'array',
                            'items' => ['type' => 'string', 'format' => 'uuid'],
                        ],
                    ],
                ],
            ],
        ],
    ];
}

it('expands speakersByDay to one entry per assigned day', function () {
    $day1a = Speaker::factory()->forSummit($this->summit, day: 1)->create(['sort_order' => 0]);
    $day1b = Speaker::factory()->forSummit($this->summit, day: 1)->create(['sort_order' => 1]);
    $day2a = Speaker::factory()->forSummit($this->summit, day: 2)->create(['sort_order' => 0]);

    $byDay = SectionPlaceholderFiller::speakersByDayFor($this->summit->id);
    $flat = SectionPlaceholderFiller::speakerIdsFor($this->summit->id);

    $result = $this->filler->fill(byDaySectionSchema(), $flat, $byDay);

    expect($result['speakersByDay'])->toHaveCount(2);
    expect($result['speakersByDay'][0]['dayLabel'])->toBe('Day 1');
    expect($result['speakersByDay'][0]['speakerIds'])->toEqualCanonicalizing([$day1a->id, $day1b->id]);
    expect($result['speakersByDay'][1]['dayLabel'])->toBe('Day 2');
    expect($result['speakersByDay'][1]['speakerIds'])->toEqualCanonicalizing([$day2a->id]);
});

it('falls back to a single entry when no speakers have day_number', function () {
    Speaker::factory()->count(2)->forSummit($this->summit)->create();

    $byDay = SectionPlaceholderFiller::speakersByDayFor($this->summit->id);
    $flat = SectionPlaceholderFiller::speakerIdsFor($this->summit->id);

    expect($byDay)->toBe([]);

    $result = $this->filler->fill(byDaySectionSchema(), $flat, $byDay);

    expect($result['speakersByDay'])->toHaveCount(1);
    expect($result['speakersByDay'][0])->toHaveKey('dayLabel');
});

it('ignores day grouping on plain single-object speaker sections', function () {
    Speaker::factory()->forSummit($this->summit, day: 1)->create(['sort_order' => 0]);
    Speaker::factory()->forSummit($this->summit, day: 2)->create(['sort_order' => 0]);

    $singleDaySchema = [
        'type' => 'object',
        'required' => ['speakersDay'],
        'properties' => [
            'speakersDay' => [
                'type' => 'object',
                'required' => ['dayLabel', 'speakerIds'],
                'properties' => [
                    'dayLabel' => ['type' => 'string', 'minLength' => 1],
                    'speakerIds' => [
                        'type' => 'array',
                        'items' => ['type' => 'string', 'format' => 'uuid'],
                    ],
                ],
            ],
        ],
    ];

    $byDay = SectionPlaceholderFiller::speakersByDayFor($this->summit->id);
    $flat = SectionPlaceholderFiller::speakerIdsFor($this->summit->id);

    $result = $this->filler->fill($singleDaySchema, $flat, $byDay);

    expect($result['speakersDay']['speakerIds'])->toEqualCanonicalizing($flat);
});

it('speakersByDayFor groups by day_number and skips unassigned speakers', function () {
    Speaker::factory()->forSummit($this->summit, day: 1)->create();
    Speaker::factory()->forSummit($this->summit)->create();
    Speaker::factory()->forSummit($this->summit, day: 3)->create();

    $byDay = SectionPlaceholderFiller::speakersByDayFor($this->summit->id);

    expect(array_keys($byDay))->toBe([1, 3]);
    expect($byDay[1])->toHaveCount(1);
    expect($byDay[3])->toHaveCount(1);
});
