<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE landing_page_batches (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
                version_count SMALLINT NOT NULL DEFAULT 3,
                status VARCHAR(50) NOT NULL DEFAULT \'queued\',
                notes TEXT,
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');

        DB::statement('
            CREATE TABLE landing_page_drafts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_id UUID NOT NULL REFERENCES landing_page_batches(id) ON DELETE CASCADE,
                version_number SMALLINT NOT NULL,
                blocks JSONB,
                status VARCHAR(50) NOT NULL DEFAULT \'pending\',
                preview_token VARCHAR(64) NOT NULL UNIQUE,
                error_message VARCHAR(500),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_draft_batch_version UNIQUE (batch_id, version_number)
            )
        ');

        DB::statement('CREATE INDEX idx_landing_page_drafts_batch ON landing_page_drafts (batch_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS landing_page_drafts');
        DB::statement('DROP TABLE IF EXISTS landing_page_batches');
    }
};
