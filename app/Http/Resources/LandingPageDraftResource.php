<?php

namespace App\Http\Resources;

use App\Models\LandingPageDraft;
use App\Services\Templates\MediaContentResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property LandingPageDraft $resource
 */
class LandingPageDraftResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $draft = $this->resource;
        $batch = $draft->batch;
        $summit = $batch?->summit;
        $funnel = $batch?->funnel;
        $step = $batch?->funnelStep;

        $rawSections = $draft->sections ?? $draft->blocks ?? [];

        return [
            'template_key' => $draft->template_key,
            // Historically `sections` / `blocks` stored the full template
            // content tree (nested object: { hero: {...}, summit: {...} }),
            // which templates render as-is. Newer AI drafts store a flat
            // array of Section objects (see SectionResource). Detect which
            // one we have so both render paths keep working.
            'content' => self::normalizeContent($rawSections, $request),
            'enabled_sections' => $draft->enabled_sections,
            'audience' => $draft->audience?->value,
            'palette' => $draft->palette,
            'speakers' => $summit
                ? SpeakerResource::collection($summit->speakers()->get())->toArray($request)
                : [],
            'funnel_id' => $funnel?->id,
            'step_type' => $step?->step_type,
            'wp_checkout_redirect_url' => $funnel?->wp_checkout_redirect_url,
            'wp_thankyou_redirect_url' => $funnel?->wp_thankyou_redirect_url,
            'meta_pixel_id' => $summit?->domain?->meta_pixel_id,
            'status' => $draft->status?->value,
        ];
    }

    /**
     * @param  mixed  $raw
     * @return array<int|string, mixed>
     */
    private static function normalizeContent($raw, Request $request): array
    {
        if (! is_array($raw) || $raw === []) {
            return [];
        }

        // Flat list of Section-shaped items: normalize each through
        // SectionResource. Associative content trees pass through untouched.
        $isList = array_keys($raw) === range(0, count($raw) - 1);
        $looksLikeSections = $isList && is_array($raw[0] ?? null) && isset($raw[0]['type']);

        $content = $looksLikeSections
            ? SectionResource::collection($raw)->toArray($request)
            : $raw;

        return app(MediaContentResolver::class)->resolve($content);
    }
}
