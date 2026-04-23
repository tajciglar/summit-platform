<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = [
            'orders_contact_id_idx' => 'CREATE INDEX IF NOT EXISTS orders_contact_id_idx ON orders(contact_id)',
            'orders_funnel_step_id_idx' => 'CREATE INDEX IF NOT EXISTS orders_funnel_step_id_idx ON orders(funnel_step_id)',
            'orders_stripe_checkout_session_idx' => 'CREATE INDEX IF NOT EXISTS orders_stripe_checkout_session_idx ON orders(stripe_checkout_session_id)',
            'optins_funnel_step_id_idx' => 'CREATE INDEX IF NOT EXISTS optins_funnel_step_id_idx ON optins(funnel_step_id)',
            'optins_user_id_idx' => 'CREATE INDEX IF NOT EXISTS optins_user_id_idx ON optins(user_id)',
            'funnel_step_bumps_product_id_idx' => 'CREATE INDEX IF NOT EXISTS funnel_step_bumps_product_id_idx ON funnel_step_bumps(product_id)',
            'page_views_user_id_idx' => 'CREATE INDEX IF NOT EXISTS page_views_user_id_idx ON page_views(user_id)',
            'landing_page_batches_funnel_step_id_idx' => 'CREATE INDEX IF NOT EXISTS landing_page_batches_funnel_step_id_idx ON landing_page_batches(funnel_step_id)',
            'landing_page_batches_published_by_user_id_idx' => 'CREATE INDEX IF NOT EXISTS landing_page_batches_published_by_user_id_idx ON landing_page_batches(published_by_user_id)',
            'media_items_created_by_user_id_idx' => 'CREATE INDEX IF NOT EXISTS media_items_created_by_user_id_idx ON media_items(created_by_user_id)',
        ];

        foreach ($indexes as $sql) {
            DB::statement($sql);
        }
    }

    public function down(): void
    {
        $names = [
            'orders_contact_id_idx',
            'orders_funnel_step_id_idx',
            'orders_stripe_checkout_session_idx',
            'optins_funnel_step_id_idx',
            'optins_user_id_idx',
            'funnel_step_bumps_product_id_idx',
            'page_views_user_id_idx',
            'landing_page_batches_funnel_step_id_idx',
            'landing_page_batches_published_by_user_id_idx',
            'media_items_created_by_user_id_idx',
        ];

        foreach ($names as $name) {
            DB::statement("DROP INDEX IF EXISTS {$name}");
        }
    }
};
