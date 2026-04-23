<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('funnels', function (Blueprint $table) {
            $table->string('wp_thankyou_redirect_url')->nullable()->after('wp_checkout_redirect_url');
        });
    }

    public function down(): void
    {
        Schema::table('funnels', function (Blueprint $table) {
            $table->dropColumn('wp_thankyou_redirect_url');
        });
    }
};
