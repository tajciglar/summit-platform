<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop first so migrate:fresh is idempotent across runs.
        // Includes V1-only enums that never got rewritten (order_item_type,
        // campaign_activity_type, checklist_item_status) so a fresh DB is clean.
        $types = [
            'coupon_type',
            'commission_status',
            'refund_reason',
            'order_status',
            'order_item_type',
            'funnel_step_type',
            'billing_interval',
            'product_type',
            'summit_phase',
            'summit_status',
            'campaign_activity_type',
            'checklist_item_status',
        ];
        foreach ($types as $type) {
            DB::statement("DROP TYPE IF EXISTS {$type} CASCADE");
        }

        DB::statement("CREATE TYPE summit_status AS ENUM ('draft', 'published', 'archived')");
        DB::statement("CREATE TYPE summit_phase AS ENUM ('pre', 'late_pre', 'during', 'post')");
        DB::statement("CREATE TYPE product_type AS ENUM ('one_time', 'subscription')");
        DB::statement("CREATE TYPE billing_interval AS ENUM ('month', 'year')");
        DB::statement("CREATE TYPE funnel_step_type AS ENUM ('optin', 'sales_page', 'checkout', 'upsell', 'downsell', 'thank_you')");
        DB::statement("CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'partial_refund', 'failed')");
        DB::statement("CREATE TYPE refund_reason AS ENUM ('requested', 'duplicate', 'fraudulent', 'product_issue', 'other')");
        DB::statement("CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'rejected')");
        DB::statement("CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount')");
    }

    public function down(): void
    {
        foreach (['coupon_type', 'commission_status', 'refund_reason', 'order_status', 'order_item_type', 'funnel_step_type', 'billing_interval', 'product_type', 'summit_phase', 'summit_status', 'campaign_activity_type', 'checklist_item_status'] as $type) {
            DB::statement("DROP TYPE IF EXISTS {$type} CASCADE");
        }
    }
};
