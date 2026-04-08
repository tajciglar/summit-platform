<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The default Laravel users table uses auto-increment bigint.
        // We need to add the spec's additional columns.
        // Note: Laravel's default users migration already creates id, name, email, password, etc.
        // We add the missing columns from the spec.
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name', 255)->nullable()->after('name');
            $table->string('last_name', 255)->nullable()->after('first_name');
            $table->string('role', 20)->default('buyer')->after('password'); // user_role
            $table->string('stripe_customer_id', 255)->nullable()->after('role');
            $table->string('activecampaign_id', 255)->nullable()->after('stripe_customer_id');
            $table->boolean('is_active')->default(true)->after('activecampaign_id');
            $table->timestampTz('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name', 'last_name', 'role', 'stripe_customer_id',
                'activecampaign_id', 'is_active', 'last_login_at',
            ]);
        });
    }
};
