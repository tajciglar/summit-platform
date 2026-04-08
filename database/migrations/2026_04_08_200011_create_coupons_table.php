<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
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
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');

        // Add FK from orders to coupons (deferred)
        DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_coupon_id_fk FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_coupon_id_fk');
        DB::statement('DROP TABLE IF EXISTS coupons');
    }
};
