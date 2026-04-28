<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('DROP INDEX IF EXISTS speakers_goes_live_at_idx');
        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS goes_live_at');
        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS is_featured');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE speakers ADD COLUMN IF NOT EXISTS goes_live_at TIMESTAMPTZ');
        DB::statement('ALTER TABLE speakers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false');
        DB::statement('CREATE INDEX IF NOT EXISTS speakers_goes_live_at_idx ON speakers(goes_live_at)');
    }
};
