<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE optins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                email VARCHAR(255) NOT NULL,
                first_name VARCHAR(120),
                utm_source VARCHAR(120),
                utm_medium VARCHAR(120),
                utm_campaign VARCHAR(120),
                referrer TEXT,
                user_agent TEXT,
                ip_address INET,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
        DB::statement('CREATE INDEX optins_funnel_id_idx ON optins(funnel_id)');
        DB::statement('CREATE INDEX optins_summit_id_idx ON optins(summit_id)');
        DB::statement('CREATE INDEX optins_email_idx ON optins(LOWER(email))');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS optins');
    }
};
