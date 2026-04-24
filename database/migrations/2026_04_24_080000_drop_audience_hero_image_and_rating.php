<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE summits DROP COLUMN IF EXISTS audience');
        DB::statement('ALTER TABLE summits DROP COLUMN IF EXISTS hero_image_url');
        DB::statement('ALTER TABLE landing_page_batches DROP COLUMN IF EXISTS audience_override');
        DB::statement('ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS audience');
        DB::statement('ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS palette');
        DB::statement('ALTER TABLE speakers DROP CONSTRAINT IF EXISTS speakers_rating_check');
        DB::statement('ALTER TABLE speakers DROP COLUMN IF EXISTS rating');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE summits ADD COLUMN audience VARCHAR(255)');
        DB::statement('ALTER TABLE summits ADD COLUMN hero_image_url TEXT');
        DB::statement('ALTER TABLE landing_page_batches ADD COLUMN audience_override VARCHAR(255)');
        DB::statement('ALTER TABLE landing_page_drafts ADD COLUMN audience VARCHAR(255)');
        DB::statement('ALTER TABLE landing_page_drafts ADD COLUMN palette JSONB');
        DB::statement('ALTER TABLE speakers ADD COLUMN rating SMALLINT');
        DB::statement('ALTER TABLE speakers ADD CONSTRAINT speakers_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))');
    }
};
