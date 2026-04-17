<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE landing_page_drafts ADD COLUMN template_key VARCHAR(64)");
        DB::statement("ALTER TABLE landing_page_drafts ADD COLUMN token_count INTEGER");
        DB::statement("ALTER TABLE landing_page_drafts ADD COLUMN generation_ms INTEGER");
        DB::statement("CREATE INDEX landing_page_drafts_template_key_idx ON landing_page_drafts(template_key)");

        DB::statement("ALTER TABLE landing_page_batches ADD COLUMN template_pool JSONB");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS landing_page_drafts_template_key_idx");
        DB::statement("ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS template_key");
        DB::statement("ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS token_count");
        DB::statement("ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS generation_ms");

        DB::statement("ALTER TABLE landing_page_batches DROP COLUMN IF EXISTS template_pool");
    }
};
