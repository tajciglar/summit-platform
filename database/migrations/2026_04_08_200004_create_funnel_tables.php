<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. funnels — enum column for target_phase
        DB::statement("
            CREATE TABLE funnels (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                slug VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                description TEXT,
                target_phase summit_phase,
                is_active BOOLEAN NOT NULL DEFAULT true,
                theme JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (summit_id, slug)
            )
        ");

        // 2. funnel_steps — enum column for step_type
        DB::statement("
            CREATE TABLE funnel_steps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
                step_type funnel_step_type NOT NULL,
                template VARCHAR(50) NOT NULL DEFAULT 'default',
                slug VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                content JSONB NOT NULL DEFAULT '{}',
                sort_order INTEGER NOT NULL DEFAULT 0,
                product_id UUID REFERENCES products(id) ON DELETE SET NULL,
                is_published BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (funnel_id, slug)
            )
        ");

        // 3. funnel_step_bumps
        Schema::create('funnel_step_bumps', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('funnel_step_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('headline', 500)->nullable();
            $table->text('description')->nullable();
            $table->jsonb('bullets')->default('[]');
            $table->string('checkbox_label', 255)->nullable();
            $table->text('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_step_bumps');
        DB::statement('DROP TABLE IF EXISTS funnel_steps');
        DB::statement('DROP TABLE IF EXISTS funnels');
    }
};
