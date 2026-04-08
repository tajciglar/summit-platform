<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. summits
        DB::statement("
            CREATE TABLE summits (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug VARCHAR(255) NOT NULL UNIQUE,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                topic VARCHAR(255),
                hero_image_url TEXT,
                status summit_status NOT NULL DEFAULT 'draft',
                current_phase summit_phase NOT NULL DEFAULT 'pre_summit',
                timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
                starts_at TIMESTAMPTZ,
                ends_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        // 2. summit_phase_schedules
        DB::statement('
            CREATE TABLE summit_phase_schedules (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                phase summit_phase NOT NULL,
                starts_at TIMESTAMPTZ NOT NULL,
                ends_at TIMESTAMPTZ,
                UNIQUE (summit_id, phase)
            )
        ');

        // 3. summit_pages
        Schema::create('summit_pages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('summit_id')->constrained()->cascadeOnDelete();
            $table->string('slug', 255);
            $table->string('title', 500);
            $table->text('content')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestampsTz();

            $table->unique(['summit_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('summit_pages');
        Schema::dropIfExists('summit_phase_schedules');
        Schema::dropIfExists('summits');
    }
};
