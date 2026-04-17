<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE funnel_step_revisions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                funnel_step_id UUID REFERENCES funnel_steps(id) ON DELETE SET NULL,
                page_content_snapshot JSONB NOT NULL,
                published_at TIMESTAMPTZ NOT NULL,
                published_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
        DB::statement('CREATE INDEX funnel_step_revisions_step_id_published_at_idx ON funnel_step_revisions(funnel_step_id, published_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS funnel_step_revisions');
    }
};
