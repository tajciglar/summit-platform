<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('speaker_summit')->whereNull('day_number')->update(['day_number' => 1]);

        Schema::table('speaker_summit', function (Blueprint $table) {
            $table->smallInteger('day_number')->nullable(false)->change();
        });

        DB::table('funnels')->whereNull('target_phase')->update(['target_phase' => 'pre']);

        DB::statement('DROP INDEX IF EXISTS users_stripe_customer_id_idx');
        DB::statement('CREATE UNIQUE INDEX users_stripe_customer_id_unique ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS users_stripe_customer_id_unique');
        DB::statement('CREATE INDEX users_stripe_customer_id_idx ON users(stripe_customer_id)');

        Schema::table('speaker_summit', function (Blueprint $table) {
            $table->smallInteger('day_number')->nullable()->change();
        });
    }
};
