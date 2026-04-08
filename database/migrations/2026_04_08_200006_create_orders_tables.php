<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. orders — multiple enum columns
        DB::statement("
            CREATE TABLE orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_number VARCHAR(50) NOT NULL UNIQUE,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                summit_id UUID REFERENCES summits(id) ON DELETE SET NULL,
                funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
                funnel_step_id UUID REFERENCES funnel_steps(id) ON DELETE SET NULL,
                summit_phase_at_purchase summit_phase,
                status order_status NOT NULL DEFAULT 'pending',
                subtotal_cents INTEGER NOT NULL DEFAULT 0,
                discount_cents INTEGER NOT NULL DEFAULT 0,
                total_cents INTEGER NOT NULL DEFAULT 0,
                currency CHAR(3) NOT NULL DEFAULT 'USD',
                coupon_id UUID,
                stripe_payment_intent_id VARCHAR(255),
                stripe_checkout_session_id VARCHAR(255),
                affiliate_id UUID,
                ip_address INET,
                user_agent TEXT,
                utm_source VARCHAR(255),
                utm_medium VARCHAR(255),
                utm_campaign VARCHAR(255),
                utm_content VARCHAR(255),
                utm_term VARCHAR(255),
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // Indexes for orders
        DB::statement('CREATE INDEX orders_user_id_idx ON orders(user_id)');
        DB::statement('CREATE INDEX orders_summit_id_idx ON orders(summit_id)');
        DB::statement('CREATE INDEX orders_funnel_id_idx ON orders(funnel_id)');
        DB::statement('CREATE INDEX orders_status_idx ON orders(status)');
        DB::statement('CREATE INDEX orders_completed_at_idx ON orders(completed_at)');
        DB::statement('CREATE INDEX orders_stripe_pi_idx ON orders(stripe_payment_intent_id)');
        DB::statement('CREATE INDEX orders_utm_idx ON orders(utm_source, utm_campaign)');

        // 2. order_items — enum column for item_type
        DB::statement("
            CREATE TABLE order_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_id UUID NOT NULL REFERENCES products(id),
                item_type order_item_type NOT NULL DEFAULT 'primary',
                product_name VARCHAR(500) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                unit_price_cents INTEGER NOT NULL,
                total_cents INTEGER NOT NULL,
                stripe_price_id VARCHAR(255),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX order_items_order_id_idx ON order_items(order_id)');
        DB::statement('CREATE INDEX order_items_product_id_idx ON order_items(product_id)');
        DB::statement('CREATE INDEX order_items_item_type_idx ON order_items(item_type)');

        // 3. subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->constrained();
            $table->foreignUuid('product_id')->constrained();
            $table->foreignUuid('order_id')->constrained();
            $table->string('stripe_subscription_id', 255)->unique();
            $table->string('status', 50)->default('active');
            $table->timestampTz('current_period_start')->nullable();
            $table->timestampTz('current_period_end')->nullable();
            $table->timestampTz('canceled_at')->nullable();
            $table->timestampsTz();

            $table->index('user_id');
            $table->index('status');
        });

        // 4. refunds — enum column for reason
        DB::statement("
            CREATE TABLE refunds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID NOT NULL REFERENCES orders(id),
                amount_cents INTEGER NOT NULL,
                reason refund_reason NOT NULL DEFAULT 'requested',
                reason_detail TEXT,
                stripe_refund_id VARCHAR(255),
                refunded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS refunds');
        Schema::dropIfExists('subscriptions');
        DB::statement('DROP TABLE IF EXISTS order_items');
        DB::statement('DROP TABLE IF EXISTS orders');
    }
};
