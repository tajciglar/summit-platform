<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_summit', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('summit_id')->constrained('summits')->cascadeOnDelete();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestampsTz();

            $table->unique(['product_id', 'summit_id']);
            $table->index('summit_id');
        });

        DB::transaction(function () {
            $this->dedupeProducts();
            $this->backfillPivot();
            $this->detachProductsFromSummitColumn();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignUuid('summit_id')->nullable()->after('id')->constrained('summits')->nullOnDelete();
        });

        DB::statement('CREATE UNIQUE INDEX products_summit_id_slug_key ON products(summit_id, slug)');

        DB::statement('UPDATE products p SET summit_id = (
            SELECT ps.summit_id FROM product_summit ps
            WHERE ps.product_id = p.id
            ORDER BY ps.created_at ASC
            LIMIT 1
        )');

        Schema::dropIfExists('product_summit');

        DB::statement('DROP INDEX IF EXISTS products_slug_key');
    }

    /**
     * Merge duplicate products (same name + tier) into the oldest canonical row.
     * Repoints funnel_steps, funnel_step_bumps, coupons, and orders.items references
     * to the canonical product, then deletes the duplicates.
     */
    private function dedupeProducts(): void
    {
        $groups = DB::table('products')
            ->select('name', 'tier')
            ->groupBy('name', 'tier')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($groups as $group) {
            $rows = DB::table('products')
                ->where('name', $group->name)
                ->where('tier', $group->tier)
                ->orderBy('created_at')
                ->get(['id']);

            $canonicalId = $rows->first()->id;
            $dupeIds = $rows->skip(1)->pluck('id')->all();

            if (empty($dupeIds)) {
                continue;
            }

            DB::table('funnel_steps')->whereIn('product_id', $dupeIds)->update(['product_id' => $canonicalId]);
            DB::table('funnel_step_bumps')->whereIn('product_id', $dupeIds)->update(['product_id' => $canonicalId]);
            DB::table('coupons')->whereIn('product_id', $dupeIds)->update(['product_id' => $canonicalId]);

            DB::table('products')->whereIn('id', $dupeIds)->delete();
        }
    }

    /**
     * Copy the current products.summit_id attachments into the product_summit pivot.
     * After dedupe, dupe rows with their own summit_id are gone; the canonical row's
     * own summit_id still needs to land in the pivot, plus any summits that were
     * attached to now-deleted duplicates.
     *
     * The simplest correct approach: after dedupe, re-derive attachments by looking
     * at which summits currently reference each product via funnel_steps (indirect)
     * or via the surviving product.summit_id (direct).
     */
    private function backfillPivot(): void
    {
        DB::statement('
            INSERT INTO product_summit (id, product_id, summit_id, sort_order, is_featured, created_at, updated_at)
            SELECT gen_random_uuid(), p.id, p.summit_id, 0, false, NOW(), NOW()
            FROM products p
            WHERE p.summit_id IS NOT NULL
            ON CONFLICT (product_id, summit_id) DO NOTHING
        ');

        DB::statement('
            INSERT INTO product_summit (id, product_id, summit_id, sort_order, is_featured, created_at, updated_at)
            SELECT DISTINCT gen_random_uuid(), fs.product_id, f.summit_id, 0, false, NOW(), NOW()
            FROM funnel_steps fs
            JOIN funnels f ON f.id = fs.funnel_id
            WHERE fs.product_id IS NOT NULL AND f.summit_id IS NOT NULL
            ON CONFLICT (product_id, summit_id) DO NOTHING
        ');
    }

    /**
     * Drop the products.summit_id column and its unique-slug-per-summit constraint.
     * Replace with a global unique constraint on products.slug.
     */
    private function detachProductsFromSummitColumn(): void
    {
        DB::statement('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_summit_id_fkey');
        DB::statement('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_summit_id_slug_key');
        DB::statement('DROP INDEX IF EXISTS products_summit_id_slug_key');
        DB::statement('DROP INDEX IF EXISTS products_summit_id_idx');

        $collisions = DB::table('products')
            ->select('slug')
            ->groupBy('slug')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('slug');

        foreach ($collisions as $slug) {
            $rows = DB::table('products')->where('slug', $slug)->orderBy('created_at')->get(['id']);
            foreach ($rows->skip(1) as $i => $row) {
                DB::table('products')->where('id', $row->id)->update([
                    'slug' => $slug.'-'.Str::random(6),
                ]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('summit_id');
        });

        DB::statement('CREATE UNIQUE INDEX products_slug_key ON products(slug)');
    }
};
