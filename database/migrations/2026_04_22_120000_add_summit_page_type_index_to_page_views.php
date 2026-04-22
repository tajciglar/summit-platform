<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Composite index used by FunnelMetrics::countsForSummit(). Without this,
 * COUNT(*) FILTER (...) queries degenerate to sequential scans once
 * page_views grows past a few million rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE INDEX IF NOT EXISTS page_views_summit_type_created_idx
            ON page_views (summit_id, page_type, created_at)
        ');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS page_views_summit_type_created_idx');
    }
};
