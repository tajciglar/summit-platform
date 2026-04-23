<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SpeakerResource;
use App\Models\LandingPageDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class LandingPageDraftController extends Controller
{
    public function showByToken(string $token): JsonResponse
    {
        $draft = LandingPageDraft::with('batch.summit', 'batch.funnel')
            ->where('preview_token', $token)
            ->firstOrFail();

        $batch = $draft->batch;
        $summit = $batch?->summit;
        $funnel = $batch?->funnel;

        $speakers = $summit
            ? SpeakerResource::collection($summit->speakers()->get())->toArray(request())
            : [];

        return response()->json([
            'template_key' => $draft->template_key,
            'content' => $draft->sections ?? $draft->blocks ?? [],
            'enabled_sections' => $draft->enabled_sections,
            'audience' => $draft->audience?->value,
            'palette' => $draft->palette,
            'speakers' => $speakers,
            'funnel_id' => $funnel?->id,
            'wp_checkout_redirect_url' => $funnel?->wp_checkout_redirect_url,
            'wp_thankyou_redirect_url' => $funnel?->wp_thankyou_redirect_url,
            'status' => $draft->status?->value,
        ]);
    }
}
