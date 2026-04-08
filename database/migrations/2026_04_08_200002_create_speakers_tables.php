<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. speakers
        Schema::create('speakers', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('slug', 255)->unique();
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->string('email', 255)->nullable();
            $table->text('photo_url')->nullable();
            $table->string('title', 500)->nullable();
            $table->text('short_description')->nullable();
            $table->text('long_description')->nullable();
            $table->text('website_url')->nullable();
            $table->jsonb('social_links')->nullable()->default('{}');
            $table->timestampsTz();
        });

        // 2. summit_speakers (junction)
        Schema::create('summit_speakers', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('summit_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('speaker_id')->constrained()->cascadeOnDelete();
            $table->string('masterclass_title', 500)->nullable();
            $table->text('masterclass_description')->nullable();
            $table->smallInteger('rating')->nullable();
            $table->text('free_video_url')->nullable();
            $table->text('vip_video_url')->nullable();
            $table->date('presentation_day')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->integer('free_access_window_hours')->default(24);
            $table->timestampsTz();

            $table->unique(['summit_id', 'speaker_id']);
        });

        // Add CHECK constraint for rating
        DB::statement('ALTER TABLE summit_speakers ADD CONSTRAINT summit_speakers_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))');
    }

    public function down(): void
    {
        Schema::dropIfExists('summit_speakers');
        Schema::dropIfExists('speakers');
    }
};
