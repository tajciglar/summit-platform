<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop indexes first (Postgres requires explicit drop before column).
        DB::statement('DROP INDEX IF EXISTS media_items_domain_id_category_idx');
        DB::statement('DROP INDEX IF EXISTS media_items_domain_id_sub_category_idx');

        if (Schema::hasColumn('media_items', 'domain_id')) {
            // Drop FK + column.
            Schema::table('media_items', function ($table): void {
                $table->dropColumn('domain_id');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('media_items', 'domain_id')) {
            DB::statement('ALTER TABLE media_items ADD COLUMN domain_id UUID REFERENCES domains(id) ON DELETE CASCADE');
            DB::statement('CREATE INDEX IF NOT EXISTS media_items_domain_id_category_idx ON media_items(domain_id, category)');
            DB::statement('CREATE INDEX IF NOT EXISTS media_items_domain_id_sub_category_idx ON media_items(domain_id, sub_category)');
        }
    }
};
