<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. product_categories (self-referencing hierarchy)
        DB::statement('
            CREATE TABLE product_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');

        // 2. products — use raw SQL for enum columns
        DB::statement("
            CREATE TABLE products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
                slug VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                description TEXT,
                product_type product_type NOT NULL DEFAULT 'one_time',
                billing_interval billing_interval,
                billing_interval_count INTEGER DEFAULT 1,
                tier VARCHAR(100),
                grants_vip_access BOOLEAN NOT NULL DEFAULT false,
                is_active BOOLEAN NOT NULL DEFAULT true,
                stripe_product_id VARCHAR(255),
                intro_price_cents INTEGER,
                intro_period_months INTEGER,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (summit_id, slug)
            )
        ");

        // 3. product_prices
        DB::statement('
            CREATE TABLE product_prices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                summit_phase summit_phase NOT NULL,
                amount_cents INTEGER NOT NULL,
                compare_at_cents INTEGER,
                stripe_price_id VARCHAR(255),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (product_id, summit_phase)
            )
        ');

        DB::statement('CREATE INDEX product_prices_product_id_idx ON product_prices(product_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('product_prices');
        DB::statement('DROP TABLE IF EXISTS products');
        Schema::dropIfExists('product_categories');
    }
};
