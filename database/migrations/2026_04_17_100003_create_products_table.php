<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                category VARCHAR(100),
                slug VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                description TEXT,
                product_type product_type NOT NULL DEFAULT 'one_time',
                billing_interval billing_interval,
                tier VARCHAR(100),
                grants_vip_access BOOLEAN NOT NULL DEFAULT false,
                is_active BOOLEAN NOT NULL DEFAULT true,
                stripe_product_id VARCHAR(255),

                -- Phase pricing (all cents)
                price_pre_summit_cents INTEGER,
                price_late_pre_cents INTEGER,
                price_during_cents INTEGER,
                price_post_summit_cents INTEGER,

                -- Compare-at (strikethrough) prices
                compare_pre_summit_cents INTEGER,
                compare_late_pre_cents INTEGER,
                compare_during_cents INTEGER,
                compare_post_summit_cents INTEGER,

                -- Stripe price ids per phase
                stripe_price_pre_id VARCHAR(255),
                stripe_price_late_id VARCHAR(255),
                stripe_price_during_id VARCHAR(255),
                stripe_price_post_id VARCHAR(255),

                -- Subscription intro pricing (drafted, unused for one-time P0)
                intro_price_cents INTEGER,
                intro_period_months INTEGER,

                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (summit_id, slug)
            )
        ");

        DB::statement('CREATE INDEX products_summit_id_idx ON products(summit_id)');
        DB::statement('CREATE INDEX products_category_idx ON products(category)');
        DB::statement('CREATE INDEX products_is_active_idx ON products(is_active)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS products');
    }
};
