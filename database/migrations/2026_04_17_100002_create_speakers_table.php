<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE speakers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                slug VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                photo_url TEXT,
                title VARCHAR(500),
                short_bio TEXT,
                long_bio TEXT,
                website_url TEXT,
                social_links JSONB NOT NULL DEFAULT '{}',
                masterclass_title VARCHAR(500),
                masterclass_description TEXT,
                rating SMALLINT,
                free_video_url TEXT,
                vip_video_url TEXT,
                goes_live_at TIMESTAMPTZ,
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_featured BOOLEAN NOT NULL DEFAULT false,
                free_access_window_hours INTEGER NOT NULL DEFAULT 24,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (summit_id, slug),
                CONSTRAINT speakers_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
            )
        ");

        DB::statement('CREATE INDEX speakers_summit_id_idx ON speakers(summit_id)');
        DB::statement('CREATE INDEX speakers_summit_sort_idx ON speakers(summit_id, sort_order)');
        DB::statement('CREATE INDEX speakers_goes_live_at_idx ON speakers(goes_live_at)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS speakers');
    }
};
