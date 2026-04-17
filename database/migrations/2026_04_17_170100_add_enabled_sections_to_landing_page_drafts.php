<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE landing_page_drafts ADD COLUMN enabled_sections JSONB');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS enabled_sections');
    }
};
