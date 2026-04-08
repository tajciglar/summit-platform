<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. content_access_grants
        Schema::create('content_access_grants', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('summit_id')->constrained()->cascadeOnDelete();
            $table->string('access_level', 50)->default('free');
            $table->foreignUuid('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->timestampTz('granted_at')->useCurrent();
            $table->timestampTz('expires_at')->nullable();

            $table->unique(['user_id', 'summit_id', 'access_level']);
            $table->index('user_id');
            $table->index('summit_id');
            $table->index('expires_at');
        });

        // 2. video_view_sessions
        Schema::create('video_view_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->constrained();
            $table->foreignUuid('summit_speaker_id')->constrained('summit_speakers');
            $table->timestampTz('started_at');
            $table->timestampTz('expires_at');
            $table->timestampTz('last_heartbeat_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_view_sessions');
        Schema::dropIfExists('content_access_grants');
    }
};
