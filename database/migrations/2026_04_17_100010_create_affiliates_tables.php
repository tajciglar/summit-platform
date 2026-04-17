<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * DRAFTED — schema shipped, app logic deferred.
 * Ready for when affiliate program goes live.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE affiliates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                code VARCHAR(100) NOT NULL UNIQUE,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                company VARCHAR(255),
                commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.3000,
                payment_email VARCHAR(255),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX affiliates_user_id_idx ON affiliates(user_id)');
        DB::statement('CREATE INDEX affiliates_is_active_idx ON affiliates(is_active)');

        // Attach deferred FK from orders.affiliate_id
        DB::statement('
            ALTER TABLE orders
            ADD CONSTRAINT orders_affiliate_id_fk
            FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL
        ');

        DB::statement("
            CREATE TABLE affiliate_referrals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
                visitor_session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,
                landing_url TEXT,
                ip_address INET,
                user_agent TEXT,
                utm_source VARCHAR(255),
                utm_medium VARCHAR(255),
                utm_campaign VARCHAR(255),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX affiliate_referrals_affiliate_id_idx ON affiliate_referrals(affiliate_id)');
        DB::statement('CREATE INDEX affiliate_referrals_visitor_session_id_idx ON affiliate_referrals(visitor_session_id)');

        DB::statement("
            CREATE TABLE affiliate_commissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
                order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                commission_rate DECIMAL(5,4) NOT NULL,
                order_amount_cents INTEGER NOT NULL,
                commission_cents INTEGER NOT NULL,
                status commission_status NOT NULL DEFAULT 'pending',
                paid_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX affiliate_commissions_affiliate_id_idx ON affiliate_commissions(affiliate_id)');
        DB::statement('CREATE INDEX affiliate_commissions_order_id_idx ON affiliate_commissions(order_id)');
        DB::statement('CREATE INDEX affiliate_commissions_status_idx ON affiliate_commissions(status)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS affiliate_commissions');
        DB::statement('DROP TABLE IF EXISTS affiliate_referrals');
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_affiliate_id_fk');
        DB::statement('DROP TABLE IF EXISTS affiliates');
    }
};
