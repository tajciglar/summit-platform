<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('funnel_steps', function (Blueprint $table) {
            $table->string('template', 50)->default('default')->after('type');
            $table->jsonb('content')->default('{}')->after('headline');
        });

        // Migrate existing headline values into the content JSON
        DB::statement("
            UPDATE funnel_steps
            SET content = jsonb_build_object('headline', headline)
            WHERE headline IS NOT NULL AND headline != ''
        ");
    }

    public function down(): void
    {
        Schema::table('funnel_steps', function (Blueprint $table) {
            $table->dropColumn(['template', 'content']);
        });
    }
};
