<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // product_kind distinguishes standalone products from bumps, upsells, and combos.
        DB::statement("DROP TYPE IF EXISTS product_kind CASCADE");
        DB::statement("CREATE TYPE product_kind AS ENUM ('standalone', 'bump', 'upsell', 'combo')");

        DB::statement("
            ALTER TABLE products
                ADD COLUMN kind product_kind NOT NULL DEFAULT 'standalone',
                ADD COLUMN bundled_product_ids JSONB NOT NULL DEFAULT '[]'
        ");

        DB::statement('CREATE INDEX products_kind_idx ON products(kind)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS products_kind_idx');
        DB::statement('ALTER TABLE products DROP COLUMN IF EXISTS bundled_product_ids');
        DB::statement('ALTER TABLE products DROP COLUMN IF EXISTS kind');
        DB::statement('DROP TYPE IF EXISTS product_kind CASCADE');
    }
};
