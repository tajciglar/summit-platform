<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('domains')->where('hostname', 'et.example.com')->delete();

        Schema::dropIfExists('video_view_sessions');
        Schema::dropIfExists('summit_user');
    }

    public function down(): void
    {
        Schema::create('summit_user', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('summit_id')->constrained('summits')->cascadeOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->primary(['user_id', 'summit_id']);
            $table->index('summit_id');
        });

        Schema::create('video_view_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('speaker_id')->constrained('speakers')->cascadeOnDelete();
            $table->timestampTz('started_at');
            $table->timestampTz('expires_at');
            $table->timestampTz('last_heartbeat_at')->nullable();

            $table->index('user_id');
            $table->index('speaker_id');
            $table->index('expires_at');
        });
    }
};
