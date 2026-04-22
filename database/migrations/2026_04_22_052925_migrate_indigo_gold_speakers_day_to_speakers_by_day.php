<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * indigo-gold schema moved from a single-day `speakersDay` object to a
 * multi-day `speakersByDay` array (matching ochre-ink's shape). Existing
 * rows in `funnel_steps.page_content` would fail Zod validation against the
 * new schema, so we rewrite them in place. The reverse reconstructs the
 * legacy single-day object from the first entry of the array.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('funnel_steps')
            ->where('page_content->template_key', 'indigo-gold')
            ->orderBy('id')
            ->lazy()
            ->each(function (object $row): void {
                $content = json_decode($row->page_content, true) ?: [];
                $body = $content['content'] ?? null;
                if (! is_array($body) || ! isset($body['speakersDay'])) {
                    return;
                }

                $legacy = $body['speakersDay'];
                if (! is_array($legacy)) {
                    return;
                }

                $entries = [];
                $daysList = $legacy['days'] ?? null;
                if (is_array($daysList) && $daysList !== []) {
                    foreach ($daysList as $day) {
                        if (! is_array($day)) {
                            continue;
                        }
                        $entries[] = [
                            'dayLabel' => (string) ($day['badge'] ?? 'Day 1'),
                            'headline' => (string) ($day['title'] ?? ''),
                            'speakerIds' => array_values((array) ($day['speakerIds'] ?? [])),
                        ];
                    }
                }

                if ($entries === []) {
                    $entries[] = [
                        'dayLabel' => (string) ($legacy['dayBadge'] ?? 'DAY 1'),
                        'headline' => (string) ($legacy['headline'] ?? ''),
                        'speakerIds' => array_values((array) ($legacy['speakerIds'] ?? [])),
                    ];
                }

                unset($body['speakersDay']);
                $body['speakersByDay'] = $entries;
                $content['content'] = $body;

                DB::table('funnel_steps')
                    ->where('id', $row->id)
                    ->update(['page_content' => json_encode($content)]);
            });
    }

    public function down(): void
    {
        DB::table('funnel_steps')
            ->where('page_content->template_key', 'indigo-gold')
            ->orderBy('id')
            ->lazy()
            ->each(function (object $row): void {
                $content = json_decode($row->page_content, true) ?: [];
                $body = $content['content'] ?? null;
                if (! is_array($body) || ! isset($body['speakersByDay'])) {
                    return;
                }

                $arr = $body['speakersByDay'];
                if (! is_array($arr) || $arr === []) {
                    return;
                }

                $first = $arr[0];
                $body['speakersDay'] = [
                    'dayBadge' => (string) ($first['dayLabel'] ?? 'DAY 1'),
                    'headline' => (string) ($first['headline'] ?? ''),
                    'speakerIds' => array_values((array) ($first['speakerIds'] ?? [])),
                    'days' => array_map(
                        static fn (array $entry): array => [
                            'badge' => (string) ($entry['dayLabel'] ?? 'Day 1'),
                            'title' => (string) ($entry['headline'] ?? ''),
                            'speakerIds' => array_values((array) ($entry['speakerIds'] ?? [])),
                        ],
                        $arr,
                    ),
                ];
                unset($body['speakersByDay']);
                $content['content'] = $body;

                DB::table('funnel_steps')
                    ->where('id', $row->id)
                    ->update(['page_content' => json_encode($content)]);
            });
    }
};
