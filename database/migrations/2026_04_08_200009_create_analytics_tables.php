<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. page_views (high-volume — consider partitioning in production)
        Schema::create('page_views', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('session_id', 255)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('page_url');
            $table->string('page_type', 50)->nullable();
            $table->foreignUuid('summit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('funnel_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('funnel_step_id')->nullable()->constrained()->nullOnDelete();
            $table->text('referrer_url')->nullable();
            $table->string('utm_source', 255)->nullable();
            $table->string('utm_medium', 255)->nullable();
            $table->string('utm_campaign', 255)->nullable();
            $table->string('utm_content', 255)->nullable();
            $table->string('utm_term', 255)->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->char('country_code', 2)->nullable();
            $table->string('device_type', 20)->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('session_id');
            $table->index('user_id');
            $table->index('summit_id');
            $table->index('funnel_step_id');
            $table->index('created_at');
            $table->index(['utm_source', 'utm_campaign']);
        });

        // 2. video_views
        Schema::create('video_views', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('session_id', 255)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('summit_speaker_id')->constrained('summit_speakers');
            $table->string('video_type', 10); // 'free' or 'vip'
            $table->integer('watch_duration_secs')->nullable();
            $table->boolean('completed')->default(false);
            $table->ipAddress('ip_address')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('summit_speaker_id');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_views');
        Schema::dropIfExists('page_views');
    }
};
