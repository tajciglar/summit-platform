<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE summits (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug VARCHAR(255) NOT NULL UNIQUE,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                topic VARCHAR(255),
                hero_image_url TEXT,
                status summit_status NOT NULL DEFAULT 'draft',
                current_phase summit_phase NOT NULL DEFAULT 'pre',
                timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
                pre_summit_starts_at TIMESTAMPTZ,
                late_pre_summit_starts_at TIMESTAMPTZ,
                during_summit_starts_at TIMESTAMPTZ,
                post_summit_starts_at TIMESTAMPTZ,
                ends_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX summits_status_idx ON summits(status)');
        DB::statement('CREATE INDEX summits_current_phase_idx ON summits(current_phase)');

        DB::statement("
            CREATE TABLE summit_pages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                slug VARCHAR(255) NOT NULL,
                title VARCHAR(500) NOT NULL,
                content JSONB NOT NULL DEFAULT '{}',
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (summit_id, slug)
            )
        ");

        DB::statement('CREATE INDEX summit_pages_summit_id_idx ON summit_pages(summit_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS summit_pages');
        DB::statement('DROP TABLE IF EXISTS summits');
    }
};
