<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * indigo-gold pilot initially kept speaker UUIDs in `page_content`. Now
 * speakers are late-bound at render time from the summit's Speaker table
 * via `dayNumber`, so each `speakersByDay` entry stores just the per-day
 * label/headline + the `dayNumber` key.
 *
 * Rewrite:
 *   { dayLabel, headline, speakerIds: [...] }  →  { dayNumber, dayLabel, headline }
 *
 * `dayNumber` is assigned by entry index (1-based) — the pilot never
 * produced more than one entry per step, so this matches seeded data.
 * Reverse reconstructs the `speakerIds` array by dereferencing the summit's
 * speakers whose `day_number` matches the entry's `dayNumber`.
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
                if (! is_array($body) || ! isset($body['speakersByDay']) || ! is_array($body['speakersByDay'])) {
                    return;
                }

                $rewritten = [];
                foreach ($body['speakersByDay'] as $idx => $entry) {
                    if (! is_array($entry)) {
                        continue;
                    }
                    $rewritten[] = [
                        'dayNumber' => isset($entry['dayNumber']) ? (int) $entry['dayNumber'] : $idx + 1,
                        'dayLabel' => (string) ($entry['dayLabel'] ?? 'DAY '.($idx + 1)),
                        'headline' => (string) ($entry['headline'] ?? ''),
                    ];
                }

                $body['speakersByDay'] = $rewritten;
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
                if (! is_array($body) || ! isset($body['speakersByDay']) || ! is_array($body['speakersByDay'])) {
                    return;
                }

                // Rebuild speakerIds from the live Speaker table for this summit,
                // filtered by each entry's dayNumber. If we can't locate a summit
                // for the step, leave speakerIds empty — the reversed shape will
                // fail Zod validation, which is acceptable for a dev-only rollback.
                $step = DB::table('funnel_steps')
                    ->join('funnels', 'funnels.id', '=', 'funnel_steps.funnel_id')
                    ->where('funnel_steps.id', $row->id)
                    ->select('funnels.summit_id')
                    ->first();

                $summitId = $step?->summit_id;

                $rewritten = [];
                foreach ($body['speakersByDay'] as $entry) {
                    if (! is_array($entry)) {
                        continue;
                    }
                    $dayNumber = isset($entry['dayNumber']) ? (int) $entry['dayNumber'] : 1;
                    $speakerIds = $summitId !== null
                        ? DB::table('speakers')
                            ->where('summit_id', $summitId)
                            ->where('day_number', $dayNumber)
                            ->orderBy('sort_order')
                            ->pluck('id')
                            ->all()
                        : [];

                    $rewritten[] = [
                        'dayLabel' => (string) ($entry['dayLabel'] ?? 'DAY '.$dayNumber),
                        'headline' => (string) ($entry['headline'] ?? ''),
                        'speakerIds' => array_values($speakerIds),
                    ];
                }

                $body['speakersByDay'] = $rewritten;
                $content['content'] = $body;

                DB::table('funnel_steps')
                    ->where('id', $row->id)
                    ->update(['page_content' => json_encode($content)]);
            });
    }
};
