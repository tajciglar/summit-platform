<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // coupon_id / affiliate_id FKs are added later (deferred) once those
        // tables exist. Here we only declare the columns.
        DB::statement("
            CREATE TABLE orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_number VARCHAR(50) NOT NULL UNIQUE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                visitor_session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,
                funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
                funnel_step_id UUID REFERENCES funnel_steps(id) ON DELETE SET NULL,
                phase_at_purchase summit_phase,
                status order_status NOT NULL DEFAULT 'pending',

                subtotal_cents INTEGER NOT NULL DEFAULT 0,
                discount_cents INTEGER NOT NULL DEFAULT 0,
                tax_cents INTEGER NOT NULL DEFAULT 0,
                total_cents INTEGER NOT NULL DEFAULT 0,
                currency CHAR(3) NOT NULL DEFAULT 'USD',

                -- Items stored inline. Shape:
                -- [{product_id, name, type: primary|bump|upsell|downsell, qty, unit_price_cents, total_cents, stripe_price_id}]
                items JSONB NOT NULL DEFAULT '[]',

                coupon_id UUID, -- FK added later when coupons table exists
                affiliate_id UUID, -- FK added later when affiliates table exists

                stripe_payment_intent_id VARCHAR(255),
                stripe_checkout_session_id VARCHAR(255),

                -- Subscription columns (DRAFTED — unused for P0 one-time focus)
                stripe_subscription_id VARCHAR(255),
                subscription_status VARCHAR(50),
                subscription_period_end TIMESTAMPTZ,
                subscription_canceled_at TIMESTAMPTZ,

                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX orders_user_id_idx ON orders(user_id)');
        DB::statement('CREATE INDEX orders_summit_id_idx ON orders(summit_id)');
        DB::statement('CREATE INDEX orders_visitor_session_id_idx ON orders(visitor_session_id)');
        DB::statement('CREATE INDEX orders_funnel_id_idx ON orders(funnel_id)');
        DB::statement('CREATE INDEX orders_status_idx ON orders(status)');
        DB::statement('CREATE INDEX orders_completed_at_idx ON orders(completed_at)');
        DB::statement('CREATE INDEX orders_stripe_pi_idx ON orders(stripe_payment_intent_id)');
        DB::statement('CREATE INDEX orders_stripe_subscription_idx ON orders(stripe_subscription_id)');
        DB::statement('CREATE INDEX orders_coupon_id_idx ON orders(coupon_id)');
        DB::statement('CREATE INDEX orders_affiliate_id_idx ON orders(affiliate_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS orders');
    }
};
