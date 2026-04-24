<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('stripe_sync_status', 16)->default('pending')->after('stripe_product_id');
            $table->text('stripe_sync_error')->nullable()->after('stripe_sync_status');
            $table->timestampTz('stripe_synced_at')->nullable()->after('stripe_sync_error');

            $table->index('stripe_sync_status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['stripe_sync_status']);
            $table->dropColumn(['stripe_sync_status', 'stripe_sync_error', 'stripe_synced_at']);
        });
    }
};
