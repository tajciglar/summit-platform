<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('summits', function (Blueprint $t) {
            $t->string('style_reference_url', 500)->nullable()->after('hero_image_url');
            $t->jsonb('style_brief')->nullable()->after('style_reference_url');
            $t->timestamp('style_brief_built_at')->nullable()->after('style_brief');
            $t->string('style_brief_status', 32)->default('absent')->after('style_brief_built_at');
        });
    }

    public function down(): void
    {
        Schema::table('summits', function (Blueprint $t) {
            $t->dropColumn(['style_reference_url', 'style_brief', 'style_brief_built_at', 'style_brief_status']);
        });
    }
};
