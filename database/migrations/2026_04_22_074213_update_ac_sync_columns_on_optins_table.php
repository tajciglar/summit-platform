<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE optins ADD COLUMN ac_sync_status VARCHAR(20) NOT NULL DEFAULT 'pending'");
        DB::statement('ALTER TABLE optins ADD COLUMN ac_sync_error TEXT');
        DB::statement('ALTER TABLE optins ADD COLUMN ac_synced_at TIMESTAMPTZ');

        DB::statement("UPDATE optins SET ac_sync_status = 'synced' WHERE activecampaign_synced = true");

        DB::statement('ALTER TABLE optins DROP COLUMN activecampaign_synced');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE optins ADD COLUMN activecampaign_synced BOOLEAN NOT NULL DEFAULT false');
        DB::statement("UPDATE optins SET activecampaign_synced = true WHERE ac_sync_status = 'synced'");
        DB::statement('ALTER TABLE optins DROP COLUMN ac_sync_status');
        DB::statement('ALTER TABLE optins DROP COLUMN ac_sync_error');
        DB::statement('ALTER TABLE optins DROP COLUMN ac_synced_at');
    }
};
