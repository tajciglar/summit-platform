<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * High-volume read-mostly events table. One row per HTTP page load on a
 * customer-facing funnel/summit page. Powers Funnel Performance + UTM
 * attribution analytics (conversion rate = orders / views).
 *
 * Consider range-partitioning by created_at if this grows >100M rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE page_views (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                visitor_session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
                funnel_step_id UUID REFERENCES funnel_steps(id) ON DELETE SET NULL,
                page_url TEXT NOT NULL,
                page_type VARCHAR(30),
                referrer_url TEXT,
                -- Denormalized UTM copies (avoids JOIN on every analytics query, and
                -- preserves UTM when visitor_session gets deleted)
                utm_source VARCHAR(255),
                utm_medium VARCHAR(255),
                utm_campaign VARCHAR(255),
                utm_content VARCHAR(255),
                utm_term VARCHAR(255),
                ip_address INET,
                user_agent TEXT,
                country_code CHAR(2),
                device_type VARCHAR(20),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX page_views_summit_id_created_at_idx ON page_views(summit_id, created_at DESC)');
        DB::statement('CREATE INDEX page_views_funnel_id_idx ON page_views(funnel_id)');
        DB::statement('CREATE INDEX page_views_funnel_step_id_idx ON page_views(funnel_step_id)');
        DB::statement('CREATE INDEX page_views_visitor_session_id_idx ON page_views(visitor_session_id)');
        DB::statement('CREATE INDEX page_views_utm_idx ON page_views(utm_source, utm_campaign)');
        DB::statement('CREATE INDEX page_views_created_at_idx ON page_views(created_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS page_views');
    }
};
