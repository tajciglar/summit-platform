<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replaces the domain_summit many-to-many pivot with a single `domain_id`
 * foreign key on `summits`. A summit belongs to exactly one domain (brand).
 * The M2M schema was a modeling mistake — nothing in the app treats a summit
 * as shared across domains, and allowing it has caused bugs (same funnel
 * appearing on two brands).
 *
 * Up:
 *   1. If a summit is attached to >1 domain, keep only the lexicographically
 *      smallest domain_id. This is arbitrary but deterministic; callers that
 *      need a different winner must dedupe in the seeder/application code
 *      before running the migration.
 *   2. Add nullable `domain_id` on summits, backfill from the pivot.
 *   3. Refuse to continue if any summit is still missing a domain — better
 *      to fail loud than create an orphan.
 *   4. Set NOT NULL, add FK, index, drop the pivot.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            DELETE FROM domain_summit ds
            WHERE ds.domain_id NOT IN (
                SELECT MIN(domain_id::text)::uuid
                FROM domain_summit
                WHERE summit_id = ds.summit_id
            )
        ');

        DB::statement('ALTER TABLE summits ADD COLUMN domain_id UUID NULL');

        DB::statement('
            UPDATE summits s
            SET domain_id = ds.domain_id
            FROM domain_summit ds
            WHERE ds.summit_id = s.id
        ');

        $orphans = DB::table('summits')->whereNull('domain_id')->count();
        if ($orphans > 0) {
            throw new RuntimeException(
                "Cannot enforce single-domain summits: {$orphans} summit(s) are not attached to any domain. "
                .'Attach them first or delete them, then re-run.'
            );
        }

        DB::statement('ALTER TABLE summits ALTER COLUMN domain_id SET NOT NULL');
        DB::statement('
            ALTER TABLE summits
            ADD CONSTRAINT summits_domain_id_fkey
            FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
        ');
        DB::statement('CREATE INDEX summits_domain_id_idx ON summits(domain_id)');

        DB::statement('DROP TABLE IF EXISTS domain_summit');
    }

    public function down(): void
    {
        DB::statement('
            CREATE TABLE IF NOT EXISTS domain_summit (
                domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (domain_id, summit_id)
            )
        ');

        DB::statement('CREATE INDEX IF NOT EXISTS domain_summit_summit_id_idx ON domain_summit(summit_id)');

        DB::statement('
            INSERT INTO domain_summit (domain_id, summit_id, created_at)
            SELECT domain_id, id, COALESCE(created_at, NOW())
            FROM summits
            WHERE domain_id IS NOT NULL
            ON CONFLICT DO NOTHING
        ');

        DB::statement('ALTER TABLE summits DROP CONSTRAINT IF EXISTS summits_domain_id_fkey');
        DB::statement('DROP INDEX IF EXISTS summits_domain_id_idx');
        DB::statement('ALTER TABLE summits DROP COLUMN IF EXISTS domain_id');
    }
};
