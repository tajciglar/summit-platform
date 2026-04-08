<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. affiliates
        Schema::create('affiliates', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code', 100)->unique();
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->string('email', 255)->unique();
            $table->string('company', 255)->nullable();
            $table->decimal('commission_rate', 5, 4)->default(0.3000);
            $table->string('payment_email', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
        });

        // 2. affiliate_referrals
        Schema::create('affiliate_referrals', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('affiliate_id')->constrained();
            $table->string('session_id', 255)->nullable();
            $table->text('landing_url')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('utm_source', 255)->nullable();
            $table->string('utm_medium', 255)->nullable();
            $table->string('utm_campaign', 255)->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });

        // 3. affiliate_commissions — enum column for status
        DB::statement("
            CREATE TABLE affiliate_commissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                affiliate_id UUID NOT NULL REFERENCES affiliates(id),
                order_id UUID NOT NULL REFERENCES orders(id),
                order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
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

        // Add FK from orders to affiliates (deferred because affiliates table didn't exist earlier)
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('affiliate_id')->references('id')->on('affiliates')->nullOnDelete();
            $table->index('affiliate_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['affiliate_id']);
            $table->dropIndex(['affiliate_id']);
        });

        Schema::dropIfExists('affiliate_commissions');
        Schema::dropIfExists('affiliate_referrals');
        Schema::dropIfExists('affiliates');
    }
};
