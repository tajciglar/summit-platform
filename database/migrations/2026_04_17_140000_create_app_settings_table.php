<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Single-row settings table. Global config that doesn't belong in .env
 * (brand, sender email, etc.) — everything an admin should be able to
 * edit without shipping a deploy.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE app_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                company_name VARCHAR(255) NOT NULL DEFAULT 'Summit Builder',
                support_email VARCHAR(255),
                sender_name VARCHAR(255),
                sender_email VARCHAR(255),
                default_currency CHAR(3) NOT NULL DEFAULT 'USD',
                stripe_publishable_key VARCHAR(255),
                activecampaign_list_id VARCHAR(100),
                brand_color VARCHAR(20),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // Seed a single row so AppSettings::singleton() always returns something.
        DB::statement("INSERT INTO app_settings (company_name) VALUES ('Summit Builder')");
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS app_settings');
    }
};
