<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE summit_campaign_activities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                activity_type campaign_activity_type NOT NULL,
                label VARCHAR(255),
                starts_at DATE NOT NULL,
                ends_at DATE NOT NULL,
                color VARCHAR(7),
                sort_order INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');

        DB::statement('CREATE INDEX idx_campaign_activities_summit ON summit_campaign_activities (summit_id)');
        DB::statement('CREATE INDEX idx_campaign_activities_dates ON summit_campaign_activities (starts_at, ends_at)');

        DB::statement("
            CREATE TABLE timeline_annotations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                date DATE NOT NULL,
                label VARCHAR(500) NOT NULL,
                annotation_type VARCHAR(50) NOT NULL DEFAULT 'note',
                color VARCHAR(7),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS timeline_annotations');
        DB::statement('DROP TABLE IF EXISTS summit_campaign_activities');
    }
};
