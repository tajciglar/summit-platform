<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Timer starts when a free user clicks PLAY on a masterclass video.
        // Expires after speaker.free_access_window_hours (default 24).
        DB::statement("
            CREATE TABLE video_view_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                expires_at TIMESTAMPTZ NOT NULL,
                last_heartbeat_at TIMESTAMPTZ
            )
        ");

        DB::statement('CREATE INDEX video_view_sessions_user_id_idx ON video_view_sessions(user_id)');
        DB::statement('CREATE INDEX video_view_sessions_speaker_id_idx ON video_view_sessions(speaker_id)');
        DB::statement('CREATE INDEX video_view_sessions_expires_at_idx ON video_view_sessions(expires_at)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS video_view_sessions');
    }
};
