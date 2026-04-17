<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Staging layer for the AI landing-page generator.
 *
 * Flow:
 *   1. Operator kicks off generation → 1 batch row + N draft rows (versions).
 *   2. Each draft holds its AI-generated block tree in `sections` JSONB.
 *   3. Operator picks a winner → copy its `sections` into funnel_steps.page_content.
 *
 * landing_page_drafts is intentionally separate from funnel_steps so that:
 *   - Operators can review multiple AI variants before publishing
 *   - Preview tokens grant pre-publish access
 *   - Drafts can be regenerated without touching the live step
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE landing_page_batches (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
                funnel_step_id UUID REFERENCES funnel_steps(id) ON DELETE SET NULL,
                version_count SMALLINT NOT NULL DEFAULT 3,
                status VARCHAR(50) NOT NULL DEFAULT 'queued',
                notes TEXT,
                style_reference_url TEXT,
                override_url TEXT,
                allowed_types JSONB NOT NULL DEFAULT '[]',
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX landing_page_batches_summit_id_idx ON landing_page_batches(summit_id)');
        DB::statement('CREATE INDEX landing_page_batches_funnel_id_idx ON landing_page_batches(funnel_id)');
        DB::statement('CREATE INDEX landing_page_batches_status_idx ON landing_page_batches(status)');

        DB::statement("
            CREATE TABLE landing_page_drafts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_id UUID NOT NULL REFERENCES landing_page_batches(id) ON DELETE CASCADE,
                version_number SMALLINT NOT NULL,
                blocks JSONB,
                sections JSONB,
                published_html TEXT,
                published_hydration_manifest JSONB,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                preview_token VARCHAR(64) NOT NULL UNIQUE,
                error_message VARCHAR(500),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_draft_batch_version UNIQUE (batch_id, version_number)
            )
        ");

        DB::statement('CREATE INDEX landing_page_drafts_batch_id_idx ON landing_page_drafts(batch_id)');
        DB::statement('CREATE INDEX landing_page_drafts_status_idx ON landing_page_drafts(status)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS landing_page_drafts');
        DB::statement('DROP TABLE IF EXISTS landing_page_batches');
    }
};
