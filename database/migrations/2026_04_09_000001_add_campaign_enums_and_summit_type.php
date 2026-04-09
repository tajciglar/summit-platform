<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE TYPE campaign_activity_type AS ENUM ('promo', 'peak_promo', 'event', 'book_speakers', 'interviews', 'testing', 'replay', 'custom')");
        DB::statement("CREATE TYPE checklist_item_status AS ENUM ('not_started', 'in_progress', 'done', 'not_applicable')");

        DB::statement("ALTER TABLE summits ADD COLUMN summit_type VARCHAR(20) NOT NULL DEFAULT 'new'");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE summits DROP COLUMN IF EXISTS summit_type');
        DB::statement('DROP TYPE IF EXISTS checklist_item_status');
        DB::statement('DROP TYPE IF EXISTS campaign_activity_type');
    }
};
