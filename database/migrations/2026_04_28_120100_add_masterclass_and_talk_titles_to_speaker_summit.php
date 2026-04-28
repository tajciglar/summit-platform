<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE speaker_summit ADD COLUMN IF NOT EXISTS masterclass_title VARCHAR(500)');
        DB::statement('ALTER TABLE speaker_summit ADD COLUMN IF NOT EXISTS talk_title VARCHAR(500)');

        DB::statement('
            UPDATE speaker_summit ss
            SET masterclass_title = s.masterclass_title
            FROM speakers s
            WHERE ss.speaker_id = s.id
              AND ss.masterclass_title IS NULL
              AND s.masterclass_title IS NOT NULL
        ');

        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS masterclass_title');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE speakers ADD COLUMN IF NOT EXISTS masterclass_title VARCHAR(500)');

        DB::statement('
            UPDATE speakers s
            SET masterclass_title = ss.masterclass_title
            FROM speaker_summit ss
            WHERE ss.speaker_id = s.id
              AND ss.masterclass_title IS NOT NULL
              AND s.masterclass_title IS NULL
        ');

        DB::statement('ALTER TABLE speaker_summit DROP COLUMN IF EXISTS talk_title');
        DB::statement('ALTER TABLE speaker_summit DROP COLUMN IF EXISTS masterclass_title');
    }
};
