<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->string('audience')->nullable()->after('slug');
        });

        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->string('audience_override')->nullable()->after('completed_at');
        });

        Schema::table('landing_page_drafts', function (Blueprint $table) {
            $table->string('audience')->nullable()->after('enabled_sections');
            $table->json('palette')->nullable()->after('audience');
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table) {
            $table->dropColumn(['audience', 'palette']);
        });

        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->dropColumn('audience_override');
        });

        Schema::table('summits', function (Blueprint $table) {
            $table->dropColumn('audience');
        });
    }
};
