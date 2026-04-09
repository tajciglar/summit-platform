<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE optin_weekly_targets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                year SMALLINT NOT NULL,
                week_number SMALLINT NOT NULL,
                week_start_date DATE NOT NULL,
                weekly_optins_target INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (year, week_number)
            )
        ');

        DB::statement('CREATE INDEX idx_optin_targets_week_start ON optin_weekly_targets (week_start_date)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS optin_weekly_targets');
    }
};
