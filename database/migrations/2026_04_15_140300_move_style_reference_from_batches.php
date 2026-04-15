<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasColumn('landing_page_batches', 'style_reference')) {
            DB::statement("
                UPDATE summits s
                   SET style_reference_url = b.style_reference
                  FROM landing_page_batches b
                 WHERE b.summit_id = s.id
                   AND s.style_reference_url IS NULL
                   AND b.style_reference IS NOT NULL
            ");

            Schema::table('landing_page_batches', function (Blueprint $t) {
                $t->dropColumn('style_reference');
            });
        }
    }

    public function down(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $t) {
            $t->text('style_reference')->nullable();
        });
    }
};
