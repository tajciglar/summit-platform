<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table): void {
            $table->jsonb('sections')->nullable();
            $table->longText('published_html')->nullable();
            $table->jsonb('published_hydration_manifest')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table): void {
            $table->dropColumn(['sections', 'published_html', 'published_hydration_manifest']);
        });
    }
};
