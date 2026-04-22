<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Normalize existing data: for each summit with multiple is_active=true
        // funnels, keep the oldest one live and flip the rest to draft. This
        // matches how the UI now presents the list (one Live, rest Draft).
        DB::statement(<<<'SQL'
            UPDATE funnels
            SET is_active = false
            WHERE is_active = true
              AND id NOT IN (
                  SELECT DISTINCT ON (summit_id) id
                  FROM funnels
                  WHERE is_active = true
                  ORDER BY summit_id, created_at ASC
              )
        SQL);

        // Partial unique index: at most one live funnel per summit. Draft rows
        // (is_active = false) are excluded from the index, so an unlimited
        // number of drafts per summit is still allowed.
        DB::statement('CREATE UNIQUE INDEX funnels_one_live_per_summit ON funnels (summit_id) WHERE is_active = true');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS funnels_one_live_per_summit');
    }
};
