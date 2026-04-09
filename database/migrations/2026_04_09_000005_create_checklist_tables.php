<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE summit_checklist_templates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                is_default BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ');

        DB::statement("
            CREATE TABLE checklist_template_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                template_id UUID NOT NULL REFERENCES summit_checklist_templates(id) ON DELETE CASCADE,
                category VARCHAR(100) NOT NULL,
                name VARCHAR(500) NOT NULL,
                page_type VARCHAR(100),
                sort_order INTEGER NOT NULL DEFAULT 0,
                default_tags JSONB NOT NULL DEFAULT '[]',
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX idx_template_items_template ON checklist_template_items (template_id)');

        DB::statement("
            CREATE TABLE summit_checklist_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                template_item_id UUID REFERENCES checklist_template_items(id) ON DELETE SET NULL,
                category VARCHAR(100) NOT NULL,
                name VARCHAR(500) NOT NULL,
                page_type VARCHAR(100),
                status checklist_item_status NOT NULL DEFAULT 'not_started',
                link_url TEXT,
                content_link TEXT,
                tags_wp JSONB NOT NULL DEFAULT '[]',
                tags_ac JSONB NOT NULL DEFAULT '[]',
                circle_access BOOLEAN NOT NULL DEFAULT false,
                welcome_survey BOOLEAN NOT NULL DEFAULT false,
                price_tier_cents INTEGER,
                sort_order INTEGER NOT NULL DEFAULT 0,
                comments TEXT,
                assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX idx_checklist_items_summit ON summit_checklist_items (summit_id)');
        DB::statement('CREATE INDEX idx_checklist_items_status ON summit_checklist_items (status)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS summit_checklist_items');
        DB::statement('DROP TABLE IF EXISTS checklist_template_items');
        DB::statement('DROP TABLE IF EXISTS summit_checklist_templates');
    }
};
