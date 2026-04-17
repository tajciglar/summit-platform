<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Renamed from V2-schema "sessions" to avoid collision with Laravel's
        // default auth/session storage table (also called "sessions").
        DB::statement("
            CREATE TABLE visitor_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                utm_source VARCHAR(255),
                utm_medium VARCHAR(255),
                utm_campaign VARCHAR(255),
                utm_content VARCHAR(255),
                utm_term VARCHAR(255),
                landing_url TEXT,
                referrer_url TEXT,
                ip_address INET,
                user_agent TEXT,
                country_code CHAR(2),
                device_type VARCHAR(20),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX visitor_sessions_user_id_idx ON visitor_sessions(user_id)');
        DB::statement('CREATE INDEX visitor_sessions_utm_idx ON visitor_sessions(utm_source, utm_campaign)');
        DB::statement('CREATE INDEX visitor_sessions_created_at_idx ON visitor_sessions(created_at)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS visitor_sessions');
    }
};
