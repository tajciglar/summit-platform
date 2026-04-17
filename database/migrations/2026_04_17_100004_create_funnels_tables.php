<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE funnels (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                slug VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                description TEXT,
                target_phase summit_phase,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (summit_id, slug)
            )
        ");

        DB::statement('CREATE INDEX funnels_summit_id_idx ON funnels(summit_id)');
        DB::statement('CREATE INDEX funnels_target_phase_idx ON funnels(target_phase)');

        // page_content is JSONB — holds the block tree describing how the page looks.
        DB::statement("
            CREATE TABLE funnel_steps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
                step_type funnel_step_type NOT NULL,
                slug VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                page_content JSONB NOT NULL DEFAULT '{}',
                sort_order INTEGER NOT NULL DEFAULT 0,
                product_id UUID REFERENCES products(id) ON DELETE SET NULL,
                is_published BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (funnel_id, slug)
            )
        ");

        DB::statement('CREATE INDEX funnel_steps_funnel_id_idx ON funnel_steps(funnel_id)');
        DB::statement('CREATE INDEX funnel_steps_product_id_idx ON funnel_steps(product_id)');

        DB::statement("
            CREATE TABLE funnel_step_bumps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                funnel_step_id UUID NOT NULL REFERENCES funnel_steps(id) ON DELETE CASCADE,
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                headline VARCHAR(500),
                description TEXT,
                bullets JSONB NOT NULL DEFAULT '[]',
                checkbox_label VARCHAR(255),
                image_url TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX funnel_step_bumps_step_id_idx ON funnel_step_bumps(funnel_step_id)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS funnel_step_bumps');
        DB::statement('DROP TABLE IF EXISTS funnel_steps');
        DB::statement('DROP TABLE IF EXISTS funnels');
    }
};
