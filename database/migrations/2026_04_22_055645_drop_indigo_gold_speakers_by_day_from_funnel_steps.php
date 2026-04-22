<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * indigo-gold no longer stores `speakersByDay` in page_content — speakers
 * (and their day buckets) are fully derived at render time from the
 * summit's Speaker table. Drop the field from existing rows so Zod
 * validation doesn't reject the presence of an unknown key.
 *
 * Non-reversible (the data we're dropping can be re-derived at render
 * time, so there's nothing meaningful to restore on rollback).
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
                if (! is_array($body) || ! array_key_exists('speakersByDay', $body)) {
                    return;
                }

                unset($body['speakersByDay']);
                $content['content'] = $body;

                DB::table('funnel_steps')
                    ->where('id', $row->id)
                    ->update(['page_content' => json_encode($content)]);
            });
    }

    public function down(): void
    {
        // Intentionally empty — speaker day groupings are derived at render
        // time now, there's no page_content state to restore.
    }
};
