<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE summit_daily_reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                report_date DATE NOT NULL,

                -- Computable metrics (snapshot, refreshable via recalculate action)
                views INTEGER,
                optins INTEGER,
                nr_of_purchases INTEGER,
                revenue_usd_cents INTEGER,
                revenue_eur_cents INTEGER,

                -- External / manual-entry metrics
                ad_spend_eur_cents INTEGER,
                cpc_eur_cents INTEGER,

                -- Derived rates
                optin_rate DECIMAL(8,4),
                purchase_rate DECIMAL(8,4),
                cpl_eur_cents INTEGER,
                cpo_eur_cents INTEGER,
                aov_usd_cents INTEGER,
                roas DECIMAL(8,4),
                checkout_rate DECIMAL(8,4),
                upgrade_checkout_rate DECIMAL(8,4),
                upsell_take_rate DECIMAL(8,4),

                -- Notes
                comment TEXT,
                execution_notes TEXT,

                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                UNIQUE (summit_id, report_date)
            )
        ');

        DB::statement('CREATE INDEX idx_daily_reports_summit ON summit_daily_reports (summit_id)');
        DB::statement('CREATE INDEX idx_daily_reports_date ON summit_daily_reports (report_date)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS summit_daily_reports');
    }
};
