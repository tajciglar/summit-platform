<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replaces the old `summit_phase` Postgres enum values
 * (`pre`, `late_pre`, `during`, `post`) with the new lifecycle vocabulary
 * (`summit_starts`, `summit_live`, `open_all_pages`, `summit_end`).
 *
 * Postgres can't drop values from an enum, so we follow the standard
 * "create new type → cast columns to text → rewrite values → cast back to
 * the new type → drop old type → rename" pattern.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            // 1. Create the new enum.
            DB::statement("CREATE TYPE summit_phase_new AS ENUM ('summit_starts', 'summit_live', 'open_all_pages', 'summit_end')");

            // 2. Drop dependent default + the supporting index that was created against the old type.
            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase DROP DEFAULT');
            DB::statement('DROP INDEX IF EXISTS summits_current_phase_idx');

            // 3. Cast the columns to text so we can UPDATE the string values.
            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase TYPE text USING current_phase::text');
            DB::statement('ALTER TABLE funnels ALTER COLUMN target_phase TYPE text USING target_phase::text');
            DB::statement('ALTER TABLE orders ALTER COLUMN phase_at_purchase TYPE text USING phase_at_purchase::text');

            // 4. Map old values → new values.
            $map = [
                'pre' => 'summit_starts',
                'late_pre' => 'summit_starts',
                'during' => 'summit_live',
                'post' => 'summit_end',
            ];

            foreach ($map as $old => $new) {
                DB::update('UPDATE summits SET current_phase = ? WHERE current_phase = ?', [$new, $old]);
                DB::update('UPDATE funnels SET target_phase = ? WHERE target_phase = ?', [$new, $old]);
                DB::update('UPDATE orders SET phase_at_purchase = ? WHERE phase_at_purchase = ?', [$new, $old]);
            }

            // 5. Cast columns back to the new enum type.
            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase TYPE summit_phase_new USING current_phase::summit_phase_new');
            DB::statement('ALTER TABLE funnels ALTER COLUMN target_phase TYPE summit_phase_new USING target_phase::summit_phase_new');
            DB::statement('ALTER TABLE orders ALTER COLUMN phase_at_purchase TYPE summit_phase_new USING phase_at_purchase::summit_phase_new');

            // 6. Restore the default + index, swap names: drop old type, rename new.
            DB::statement("ALTER TABLE summits ALTER COLUMN current_phase SET DEFAULT 'summit_starts'");
            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase SET NOT NULL');

            DB::statement('DROP TYPE summit_phase');
            DB::statement('ALTER TYPE summit_phase_new RENAME TO summit_phase');

            DB::statement('CREATE INDEX summits_current_phase_idx ON summits(current_phase)');
        });
    }

    public function down(): void
    {
        DB::transaction(function (): void {
            DB::statement("CREATE TYPE summit_phase_old AS ENUM ('pre', 'late_pre', 'during', 'post')");

            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase DROP DEFAULT');
            DB::statement('DROP INDEX IF EXISTS summits_current_phase_idx');

            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase TYPE text USING current_phase::text');
            DB::statement('ALTER TABLE funnels ALTER COLUMN target_phase TYPE text USING target_phase::text');
            DB::statement('ALTER TABLE orders ALTER COLUMN phase_at_purchase TYPE text USING phase_at_purchase::text');

            $reverseMap = [
                'summit_starts' => 'pre',
                'summit_live' => 'during',
                'open_all_pages' => 'post',
                'summit_end' => 'post',
            ];

            foreach ($reverseMap as $new => $old) {
                DB::update('UPDATE summits SET current_phase = ? WHERE current_phase = ?', [$old, $new]);
                DB::update('UPDATE funnels SET target_phase = ? WHERE target_phase = ?', [$old, $new]);
                DB::update('UPDATE orders SET phase_at_purchase = ? WHERE phase_at_purchase = ?', [$old, $new]);
            }

            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase TYPE summit_phase_old USING current_phase::summit_phase_old');
            DB::statement('ALTER TABLE funnels ALTER COLUMN target_phase TYPE summit_phase_old USING target_phase::summit_phase_old');
            DB::statement('ALTER TABLE orders ALTER COLUMN phase_at_purchase TYPE summit_phase_old USING phase_at_purchase::summit_phase_old');

            DB::statement("ALTER TABLE summits ALTER COLUMN current_phase SET DEFAULT 'pre'");
            DB::statement('ALTER TABLE summits ALTER COLUMN current_phase SET NOT NULL');

            DB::statement('DROP TYPE summit_phase');
            DB::statement('ALTER TYPE summit_phase_old RENAME TO summit_phase');

            DB::statement('CREATE INDEX summits_current_phase_idx ON summits(current_phase)');
        });
    }
};
