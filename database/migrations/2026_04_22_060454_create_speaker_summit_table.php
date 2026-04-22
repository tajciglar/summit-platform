<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Many-to-many pivot between speakers and summits. A single Speaker row now
 * represents a reusable video/bio that can be attached to multiple summits,
 * each scheduling it on its own day. The pivot carries the per-attachment
 * day_number and sort_order so Summit A can present the speaker on Day 2
 * while Summit B uses Day 5.
 *
 * Legacy `speakers.summit_id` and `speakers.day_number` columns stay in
 * place through commit C3 so no callsite breaks mid-refactor. They're
 * dropped in a later migration once nothing reads them.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE speaker_summit (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                day_number SMALLINT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (speaker_id, summit_id),
                CONSTRAINT speaker_summit_day_number_check CHECK (day_number IS NULL OR day_number BETWEEN 1 AND 31)
            )
        ');

        DB::statement('CREATE INDEX speaker_summit_summit_idx ON speaker_summit(summit_id)');
        DB::statement('CREATE INDEX speaker_summit_summit_day_idx ON speaker_summit(summit_id, day_number)');
        DB::statement('CREATE INDEX speaker_summit_summit_sort_idx ON speaker_summit(summit_id, sort_order)');

        // Backfill the pivot from every existing speakers row. `speakers.summit_id`
        // is NOT NULL so every row attaches to exactly one summit at this point;
        // subsequent attachments go through the Filament UI (commit C2).
        DB::statement('
            INSERT INTO speaker_summit (speaker_id, summit_id, day_number, sort_order, created_at, updated_at)
            SELECT id, summit_id, day_number, sort_order, NOW(), NOW()
            FROM speakers
        ');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS speaker_summit');
    }
};
