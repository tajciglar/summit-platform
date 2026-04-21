<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE media_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
                category VARCHAR(32) NOT NULL,
                sub_category VARCHAR(64),
                disk VARCHAR(32) NOT NULL DEFAULT 'bunny',
                path VARCHAR(512) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                mime_type VARCHAR(128),
                size BIGINT NOT NULL DEFAULT 0,
                width INTEGER,
                height INTEGER,
                caption VARCHAR(255),
                alt_text VARCHAR(255),
                created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                legacy_spatie_media_id BIGINT,

                created_at TIMESTAMPTZ,
                updated_at TIMESTAMPTZ
            )
        ");

        DB::statement('CREATE INDEX media_items_domain_id_category_idx ON media_items(domain_id, category)');
        DB::statement('CREATE INDEX media_items_domain_id_sub_category_idx ON media_items(domain_id, sub_category)');
        DB::statement('CREATE INDEX media_items_legacy_spatie_media_id_idx ON media_items(legacy_spatie_media_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS media_items');
    }
};
