<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $t) {
            $t->jsonb('allowed_types')->nullable()->after('notes');
            $t->string('style_override_url', 500)->nullable()->after('allowed_types');
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $t) {
            $t->dropColumn(['allowed_types', 'style_override_url']);
        });
    }
};
