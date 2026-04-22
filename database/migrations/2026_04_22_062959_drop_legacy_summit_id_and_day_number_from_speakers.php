<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Final step of the M2M migration: drop the legacy `speakers.summit_id`
 * and `speakers.day_number` columns now that every read path goes through
 * the `speaker_summit` pivot.
 *
 * Also replaces the old `UNIQUE (summit_id, slug)` constraint with a
 * global `UNIQUE (slug)` since slug can no longer be scoped to a summit
 * (a speaker spans multiple summits now).
 *
 * Pre-migration invariant: `SELECT slug, COUNT(*) FROM speakers GROUP BY
 * slug HAVING COUNT(*) > 1` was empty when this was authored. If the
 * invariant stops holding before deploy, this migration fails and
 * surfaces the offending slugs for manual resolution.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Drop indexes / constraints that reference the column we're removing.
        DB::statement('ALTER TABLE speakers DROP CONSTRAINT IF EXISTS speakers_summit_id_slug_key');
        DB::statement('DROP INDEX IF EXISTS speakers_summit_id_idx');
        DB::statement('DROP INDEX IF EXISTS speakers_summit_sort_idx');

        // Drop the FK (then the column) for summit_id.
        DB::statement('ALTER TABLE speakers DROP CONSTRAINT IF EXISTS speakers_summit_id_fkey');
        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS summit_id');

        // Drop day_number — per-summit day is now on the pivot.
        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS day_number');

        // Replace the composite slug-unique with a global one.
        DB::statement('ALTER TABLE speakers ADD CONSTRAINT speakers_slug_unique UNIQUE (slug)');
    }

    public function down(): void
    {
        // Best-effort reversal for dev environments. Restoring a NOT-NULL
        // summit_id from the pivot requires picking one attachment per
        // speaker — we pick the earliest by created_at.
        DB::statement('ALTER TABLE speakers DROP CONSTRAINT IF EXISTS speakers_slug_unique');
        DB::statement('ALTER TABLE speakers ADD COLUMN summit_id UUID');
        DB::statement('ALTER TABLE speakers ADD COLUMN day_number SMALLINT');
        DB::statement('
            UPDATE speakers s SET
                summit_id = (
                    SELECT ss.summit_id FROM speaker_summit ss
                    WHERE ss.speaker_id = s.id
                    ORDER BY ss.created_at ASC LIMIT 1
                ),
                day_number = (
                    SELECT ss.day_number FROM speaker_summit ss
                    WHERE ss.speaker_id = s.id
                    ORDER BY ss.created_at ASC LIMIT 1
                )
        ');
        DB::statement('
            ALTER TABLE speakers
                ADD CONSTRAINT speakers_summit_id_fkey
                FOREIGN KEY (summit_id) REFERENCES summits(id) ON DELETE CASCADE
        ');
        DB::statement('CREATE UNIQUE INDEX speakers_summit_id_slug_key ON speakers(summit_id, slug)');
        DB::statement('CREATE INDEX speakers_summit_id_idx ON speakers(summit_id)');
        DB::statement('CREATE INDEX speakers_summit_sort_idx ON speakers(summit_id, sort_order)');
    }
};
