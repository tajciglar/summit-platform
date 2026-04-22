<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The Filament Speaker form no longer exposes `summit_id` / `day_number`
 * as top-level fields — attachments live in the `speakerSummits` Repeater
 * (backed by the `speaker_summit` pivot). New speakers created through
 * that form do not set the legacy columns, so the NOT NULL constraint
 * must go. Both columns are scheduled for full removal in C4.
 *
 * Non-destructive: existing rows keep their values. Only new inserts
 * are allowed to omit them.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE speakers ALTER COLUMN summit_id DROP NOT NULL');
    }

    public function down(): void
    {
        // Restoring NOT NULL only works if every row still has a summit_id.
        // Filament-created speakers after C2 may not — the reverse path is
        // best-effort for dev rollbacks.
        DB::statement('UPDATE speakers SET summit_id = (SELECT id FROM summits LIMIT 1) WHERE summit_id IS NULL');
        DB::statement('ALTER TABLE speakers ALTER COLUMN summit_id SET NOT NULL');
    }
};
