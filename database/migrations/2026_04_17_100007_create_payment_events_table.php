<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE payment_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
                event_type VARCHAR(100) NOT NULL,
                stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
                payload JSONB NOT NULL DEFAULT '{}',
                processed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX payment_events_order_id_idx ON payment_events(order_id)');
        DB::statement('CREATE INDEX payment_events_event_type_idx ON payment_events(event_type)');
        DB::statement('CREATE INDEX payment_events_processed_at_idx ON payment_events(processed_at)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS payment_events');
    }
};
