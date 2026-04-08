<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop first in case migrate:fresh didn't clean up custom types
        DB::statement('DROP TYPE IF EXISTS coupon_type CASCADE');
        DB::statement('DROP TYPE IF EXISTS commission_status CASCADE');
        DB::statement('DROP TYPE IF EXISTS refund_reason CASCADE');
        DB::statement('DROP TYPE IF EXISTS order_item_type CASCADE');
        DB::statement('DROP TYPE IF EXISTS order_status CASCADE');
        DB::statement('DROP TYPE IF EXISTS funnel_step_type CASCADE');
        DB::statement('DROP TYPE IF EXISTS billing_interval CASCADE');
        DB::statement('DROP TYPE IF EXISTS product_type CASCADE');
        DB::statement('DROP TYPE IF EXISTS summit_phase CASCADE');
        DB::statement('DROP TYPE IF EXISTS summit_status CASCADE');

        DB::statement("CREATE TYPE summit_status AS ENUM ('draft', 'published', 'archived')");
        DB::statement("CREATE TYPE summit_phase AS ENUM ('pre_summit', 'late_pre_summit', 'during_summit', 'post_summit')");
        DB::statement("CREATE TYPE product_type AS ENUM ('one_time', 'subscription')");
        DB::statement("CREATE TYPE billing_interval AS ENUM ('month', 'year')");
        DB::statement("CREATE TYPE funnel_step_type AS ENUM ('optin', 'sales_page', 'checkout', 'upsell', 'downsell', 'thank_you')");
        DB::statement("CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'partially_refunded', 'failed')");
        DB::statement("CREATE TYPE order_item_type AS ENUM ('primary', 'bump', 'upsell', 'downsell')");
        DB::statement("CREATE TYPE refund_reason AS ENUM ('requested', 'duplicate', 'fraudulent', 'product_issue', 'other')");
        DB::statement("CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'rejected')");
        DB::statement("CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount')");
    }

    public function down(): void
    {
        DB::statement('DROP TYPE IF EXISTS coupon_type');
        DB::statement('DROP TYPE IF EXISTS commission_status');
        DB::statement('DROP TYPE IF EXISTS refund_reason');
        DB::statement('DROP TYPE IF EXISTS order_item_type');
        DB::statement('DROP TYPE IF EXISTS order_status');
        DB::statement('DROP TYPE IF EXISTS funnel_step_type');
        DB::statement('DROP TYPE IF EXISTS billing_interval');
        DB::statement('DROP TYPE IF EXISTS product_type');
        DB::statement('DROP TYPE IF EXISTS summit_phase');
        DB::statement('DROP TYPE IF EXISTS summit_status');
    }
};
