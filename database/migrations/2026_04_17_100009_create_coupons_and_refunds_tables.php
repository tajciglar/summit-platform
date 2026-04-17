<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * DRAFTED — schema shipped, app logic deferred.
 * - Coupons table defined so orders.coupon_id FK is valid.
 * - Refunds table defined so admins can record manual refund history.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE coupons (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code VARCHAR(100) NOT NULL UNIQUE,
                coupon_type coupon_type NOT NULL,
                amount INTEGER NOT NULL,
                max_uses INTEGER,
                times_used INTEGER NOT NULL DEFAULT 0,
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                product_id UUID REFERENCES products(id) ON DELETE SET NULL,
                starts_at TIMESTAMPTZ,
                expires_at TIMESTAMPTZ,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX coupons_is_active_idx ON coupons(is_active)');
        DB::statement('CREATE INDEX coupons_summit_id_idx ON coupons(summit_id)');
        DB::statement('CREATE INDEX coupons_product_id_idx ON coupons(product_id)');

        // Now that coupons exists, attach the deferred FK from orders.coupon_id
        DB::statement('
            ALTER TABLE orders
            ADD CONSTRAINT orders_coupon_id_fk
            FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
        ');

        DB::statement("
            CREATE TABLE refunds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                amount_cents INTEGER NOT NULL,
                reason refund_reason NOT NULL DEFAULT 'requested',
                reason_detail TEXT,
                stripe_refund_id VARCHAR(255),
                refunded_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX refunds_order_id_idx ON refunds(order_id)');
        DB::statement('CREATE INDEX refunds_created_at_idx ON refunds(created_at)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS refunds');
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_coupon_id_fk');
        DB::statement('DROP TABLE IF EXISTS coupons');
    }
};
