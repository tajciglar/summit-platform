<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->string('ac_optin_tag', 255)->nullable()->after('summit_type');
        });
    }

    public function down(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->dropColumn('ac_optin_tag');
        });
    }
};
