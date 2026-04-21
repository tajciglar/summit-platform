<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE media_item_attachments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                media_item_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
                attachable_id UUID NOT NULL,
                attachable_type VARCHAR(255) NOT NULL,
                role VARCHAR(64) NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,

                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                UNIQUE (attachable_id, attachable_type, role, media_item_id)
            )
        ');

        DB::statement('CREATE INDEX media_item_attachments_media_item_id_idx ON media_item_attachments(media_item_id)');
        DB::statement('CREATE INDEX media_item_attachments_attachable_idx ON media_item_attachments(attachable_type, attachable_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS media_item_attachments');
    }
};
