<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            UPDATE media_items
            SET sub_category = 'pages'
            WHERE category = 'landing_page'
              AND (sub_category IS NULL OR sub_category != 'pages')
        ");
    }

    public function down(): void
    {
        // No-op — the original sub_category vocabulary (hero/side/section/...)
        // is non-recoverable from a one-way collapse to 'pages'.
    }
};
