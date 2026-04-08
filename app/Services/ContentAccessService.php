<?php

namespace App\Services;

use App\Models\ContentAccessGrant;
use App\Models\SummitSpeaker;
use App\Models\User;
use App\Models\VideoViewSession;

class ContentAccessService
{
    /**
     * Check what level of video access a user has for a given summit speaker.
     *
     * Returns: 'vip' | 'free_active' | 'free_available' | 'locked'
     *
     * Logic (from spec):
     * 1. VIP grant? → from subscription? → subscription active? → show VIP video
     * 2. Active video_view_session (timer running)? → show free video
     * 3. Free grant exists? → user can start watching (creates session on play)
     * 4. None → locked
     */
    public function checkAccess(User $user, SummitSpeaker $summitSpeaker): string
    {
        $summitId = $summitSpeaker->summit_id;

        // Step 1: Check for VIP grant
        $vipGrant = ContentAccessGrant::where('user_id', $user->id)
            ->where('summit_id', $summitId)
            ->where('access_level', 'vip')
            ->first();

        if ($vipGrant) {
            // If from subscription, verify subscription is still active
            if ($vipGrant->subscription_id) {
                $subscription = $vipGrant->subscription;

                if ($subscription && $subscription->isActive()) {
                    return 'vip';
                }

                // Subscription lapsed — deny access
                return 'locked';
            }

            // One-time purchase — permanent VIP access
            return 'vip';
        }

        // Step 2: Check for active video_view_session
        $activeSession = VideoViewSession::where('user_id', $user->id)
            ->where('summit_speaker_id', $summitSpeaker->id)
            ->where('expires_at', '>', now())
            ->first();

        if ($activeSession) {
            return 'free_active';
        }

        // Step 3: Check for free grant
        $freeGrant = ContentAccessGrant::where('user_id', $user->id)
            ->where('summit_id', $summitId)
            ->where('access_level', 'free')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($freeGrant) {
            return 'free_available';
        }

        // Step 4: No access
        return 'locked';
    }

    /**
     * Start a free video view session.
     * Called when a free user clicks play on a speaker's video.
     */
    public function startFreeSession(User $user, SummitSpeaker $summitSpeaker): VideoViewSession
    {
        return VideoViewSession::create([
            'user_id' => $user->id,
            'summit_speaker_id' => $summitSpeaker->id,
            'started_at' => now(),
            'expires_at' => now()->addHours($summitSpeaker->free_access_window_hours),
        ]);
    }

    /**
     * Update heartbeat on an active session (video player pings periodically).
     */
    public function heartbeat(string $sessionId): void
    {
        VideoViewSession::where('id', $sessionId)
            ->where('expires_at', '>', now())
            ->update(['last_heartbeat_at' => now()]);
    }

    /**
     * Grant content access (called after purchase or opt-in).
     */
    public function grantAccess(
        User $user,
        string $summitId,
        string $accessLevel = 'free',
        ?string $orderId = null,
        ?string $subscriptionId = null,
        ?\DateTimeInterface $expiresAt = null,
    ): ContentAccessGrant {
        return ContentAccessGrant::updateOrCreate(
            [
                'user_id' => $user->id,
                'summit_id' => $summitId,
                'access_level' => $accessLevel,
            ],
            [
                'order_id' => $orderId,
                'subscription_id' => $subscriptionId,
                'granted_at' => now(),
                'expires_at' => $expiresAt,
            ],
        );
    }
}
