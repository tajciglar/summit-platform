<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('funnels', function (Blueprint $table): void {
            $table->text('notes')->nullable()->after('description');
            $table->string('ac_optin_tag', 255)->nullable()->after('notes');
        });

        // Backfill: each funnel inherits its summit's existing ac_optin_tag.
        DB::statement(<<<'SQL'
            UPDATE funnels f
            SET ac_optin_tag = s.ac_optin_tag
            FROM summits s
            WHERE f.summit_id = s.id
              AND s.ac_optin_tag IS NOT NULL
        SQL);

        Schema::table('summits', function (Blueprint $table): void {
            $table->dropColumn('ac_optin_tag');
        });
    }

    public function down(): void
    {
        Schema::table('summits', function (Blueprint $table): void {
            $table->string('ac_optin_tag', 255)->nullable()->after('summit_type');
        });

        // Best-effort: restore one tag value per summit from its first tagged funnel.
        DB::statement(<<<'SQL'
            UPDATE summits s
            SET ac_optin_tag = sub.ac_optin_tag
            FROM (
                SELECT DISTINCT ON (summit_id) summit_id, ac_optin_tag
                FROM funnels
                WHERE ac_optin_tag IS NOT NULL
                ORDER BY summit_id, created_at ASC
            ) sub
            WHERE s.id = sub.summit_id
        SQL);

        Schema::table('funnels', function (Blueprint $table): void {
            $table->dropColumn(['notes', 'ac_optin_tag']);
        });
    }
};
