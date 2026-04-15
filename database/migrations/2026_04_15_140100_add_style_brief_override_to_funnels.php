<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('funnels', function (Blueprint $t) {
            $t->jsonb('style_brief_override')->nullable()->after('theme');
            $t->jsonb('last_section_selection')->nullable()->after('style_brief_override');
        });
    }

    public function down(): void
    {
        Schema::table('funnels', function (Blueprint $t) {
            $t->dropColumn(['style_brief_override', 'last_section_selection']);
        });
    }
};
