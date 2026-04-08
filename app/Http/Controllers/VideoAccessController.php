<?php

namespace App\Http\Controllers;

use App\Models\SummitSpeaker;
use App\Models\VideoView;
use App\Services\ContentAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoAccessController extends Controller
{
    public function __construct(private readonly ContentAccessService $access) {}

    /**
     * Check access level for a summit speaker's video.
     * Returns: access_level, video_url (if allowed), session_id (if active).
     */
    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'summit_speaker_id' => ['required', 'string', 'exists:summit_speakers,id'],
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json(['access' => 'locked', 'video_url' => null]);
        }

        $summitSpeaker = SummitSpeaker::findOrFail($validated['summit_speaker_id']);
        $access = $this->access->checkAccess($user, $summitSpeaker);

        $videoUrl = match ($access) {
            'vip' => $summitSpeaker->vip_video_url ?? $summitSpeaker->free_video_url,
            'free_active' => $summitSpeaker->free_video_url,
            default => null,
        };

        return response()->json([
            'access' => $access,
            'video_url' => $videoUrl,
        ]);
    }

    /**
     * Start watching — creates a free video_view_session and returns the video URL.
     */
    public function startWatching(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'summit_speaker_id' => ['required', 'string', 'exists:summit_speakers,id'],
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Authentication required.'], 401);
        }

        $summitSpeaker = SummitSpeaker::findOrFail($validated['summit_speaker_id']);
        $access = $this->access->checkAccess($user, $summitSpeaker);

        if ($access !== 'free_available') {
            return response()->json(['error' => 'Cannot start session.', 'access' => $access], 403);
        }

        $session = $this->access->startFreeSession($user, $summitSpeaker);

        return response()->json([
            'access' => 'free_active',
            'video_url' => $summitSpeaker->free_video_url,
            'session_id' => $session->id,
            'expires_at' => $session->expires_at->toISOString(),
        ]);
    }

    /**
     * Video player heartbeat — keeps session alive and tracks watch progress.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'summit_speaker_id' => ['required', 'string', 'exists:summit_speakers,id'],
            'watch_duration_secs' => ['nullable', 'integer', 'min:0'],
            'completed' => ['nullable', 'boolean'],
        ]);

        // Update session heartbeat
        if ($validated['session_id'] ?? null) {
            $this->access->heartbeat($validated['session_id']);
        }

        // Record/update video view analytics
        $user = $request->user();
        if ($user) {
            $summitSpeaker = SummitSpeaker::find($validated['summit_speaker_id']);
            $videoType = $summitSpeaker?->vip_video_url ? 'vip' : 'free';

            VideoView::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'summit_speaker_id' => $validated['summit_speaker_id'],
                    'session_id' => $request->cookie('session_id'),
                ],
                [
                    'video_type' => $videoType,
                    'watch_duration_secs' => $validated['watch_duration_secs'] ?? 0,
                    'completed' => $validated['completed'] ?? false,
                    'ip_address' => $request->ip(),
                ],
            );
        }

        return response()->json(['ok' => true]);
    }
}
