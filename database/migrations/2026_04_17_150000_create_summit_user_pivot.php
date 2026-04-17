<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Pivot table linking admins to the summits they can operate on.
 * Makes Summit a Filament tenant: one admin can work across many summits,
 * and the tenant switcher in the panel lists each user's allowed set.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE summit_user (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (user_id, summit_id)
            )
        ');

        DB::statement('CREATE INDEX summit_user_summit_id_idx ON summit_user(summit_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS summit_user');
    }
};
