<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE speakers ADD COLUMN day_number SMALLINT');
        DB::statement('ALTER TABLE speakers ADD CONSTRAINT speakers_day_number_check CHECK (day_number IS NULL OR day_number >= 1)');
        DB::statement('CREATE INDEX speakers_summit_day_idx ON speakers(summit_id, day_number)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS speakers_summit_day_idx');
        DB::statement('ALTER TABLE speakers DROP CONSTRAINT IF EXISTS speakers_day_number_check');
        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS day_number');
    }
};
