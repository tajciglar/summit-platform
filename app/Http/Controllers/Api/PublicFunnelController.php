<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SpeakerResource;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PublicFunnelController extends Controller
{
    public function show(Request $request, string $funnelId): JsonResponse
    {
        $stepType = $request->query('step_type', 'optin');

        $funnel = Funnel::with(['steps' => fn ($q) => $q->where('step_type', $stepType)])
            ->findOrFail($funnelId);

        $step = $funnel->steps->first();
        $content = $step?->page_content ?? null;

        if (! $content || ! isset($content['template_key'])) {
            return response()->json(['error' => 'no published content'], 404);
        }

        // Fall back to the funnel's per-step section_config when the step's
        // page_content doesn't carry its own enabled_sections. This is what
        // the template family flow ("one skin, different sections per step")
        // relies on so sales_page renders the sales section mix.
        if (! isset($content['enabled_sections']) && is_array($funnel->section_config ?? null)) {
            $forStep = $funnel->section_config[$stepType] ?? null;
            if (is_array($forStep) && $forStep !== []) {
                $content['enabled_sections'] = array_values($forStep);
            }
        }

        // WP checkout redirect is a sales-page concept; other step types must
        // keep their native CTAs (e.g. optin → modal).
        $isSales = $stepType === 'sales_page';
        $wpUrl = $isSales ? $funnel->wp_checkout_redirect_url : null;
        $wpThankyouUrl = $isSales ? $funnel->wp_thankyou_redirect_url : null;

        return response()->json($this->payload($content, $funnel->summit_id, $funnel->id, $step?->id, $wpUrl, $wpThankyouUrl, is_array($step?->page_overrides ?? null) ? $step->page_overrides : null, $step?->step_type));
    }

    /**
     * Host-based funnel resolver used by the public Next.js route
     * /{funnel-slug}/{step-slug?}. Resolves a request by (host, funnel slug)
     * so a single Next deployment can serve many operator domains.
     *
     *   Query: host=<hostname>   (required) — strips leading "www."
     *          funnel=<slug>     (required) — Funnel.slug
     *          step=<slug>       (optional) — FunnelStep.slug, defaults to
     *                                         the optin step for the funnel
     *
     * Returns the same payload shape as showStep() — template_key + content +
     * palette + tokens + sections + speakers + funnel metadata.
     */
    public function resolveByHost(Request $request): JsonResponse
    {
        $host = (string) $request->query('host', '');
        $funnelSlug = (string) $request->query('funnel', '');
        $stepSlug = (string) $request->query('step', '');

        if ($host === '' || $funnelSlug === '') {
            return response()->json(['error' => 'host and funnel are required'], 422);
        }

        // Tolerate "www." prefix on the Host header — Domain rows store bare
        // hostnames ("althea-academy.com") so requests to both apex and www
        // resolve the same domain.
        $normalized = preg_replace('/^www\./i', '', strtolower($host)) ?? $host;

        $domain = Domain::query()
            ->where(fn ($q) => $q->where('hostname', $normalized)->orWhere('hostname', $host))
            ->where('is_active', true)
            ->first();

        if (! $domain) {
            return response()->json(['error' => "unknown host: {$host}"], 404);
        }

        // Funnels live under summits; summits live under a domain. Resolve by
        // joining — no need to know which summit the funnel belongs to.
        $funnel = Funnel::query()
            ->whereIn('summit_id', $domain->summits()->pluck('id'))
            ->where('slug', $funnelSlug)
            ->where('is_active', true)
            ->first();

        if (! $funnel) {
            return response()->json(['error' => "unknown funnel: {$funnelSlug}"], 404);
        }

        // Step: explicit slug wins; otherwise optin.
        $stepQuery = $funnel->steps()->where('is_published', true);
        $step = $stepSlug !== ''
            ? $stepQuery->where('slug', $stepSlug)->first()
            : $stepQuery->where('step_type', 'optin')->first();

        if (! $step) {
            return response()->json(['error' => 'step not found'], 404);
        }

        $content = $step->page_content;
        if (! is_array($content) || ! isset($content['template_key'])) {
            return response()->json(['error' => 'step has no published content'], 404);
        }

        if (! isset($content['enabled_sections']) && is_array($funnel->section_config ?? null)) {
            $forStep = $funnel->section_config[$step->step_type] ?? null;
            if (is_array($forStep) && $forStep !== []) {
                $content['enabled_sections'] = array_values($forStep);
            }
        }

        $isSales = $step->step_type === 'sales_page';
        $wpUrl = $isSales ? $funnel->wp_checkout_redirect_url : null;
        $wpThankyouUrl = $isSales ? $funnel->wp_thankyou_redirect_url : null;

        return response()->json(
            $this->payload(
                $content,
                $funnel->summit_id,
                $funnel->id,
                $step->id,
                $wpUrl,
                $wpThankyouUrl,
                is_array($step->page_overrides) ? $step->page_overrides : null,
                $step->step_type,
            ),
        );
    }

    /**
     * Admin-facing preview that mirrors the exact `page_content` of a single
     * step. Used by the Filament "Preview live" button so block edits appear
     * in preview immediately, without going through a draft publish.
     */
    public function showStep(FunnelStep $step): JsonResponse
    {
        $content = $step->page_content;

        if (! is_array($content) || ! isset($content['template_key'])) {
            return response()->json(['error' => 'step has no editable page_content'], 404);
        }

        $funnel = $step->funnel;

        if (! isset($content['enabled_sections']) && $funnel && is_array($funnel->section_config ?? null)) {
            $forStep = $funnel->section_config[$step->step_type] ?? null;
            if (is_array($forStep) && $forStep !== []) {
                $content['enabled_sections'] = array_values($forStep);
            }
        }

        $isSales = $step->step_type === 'sales_page';
        $wpUrl = $isSales ? $funnel?->wp_checkout_redirect_url : null;
        $wpThankyouUrl = $isSales ? $funnel?->wp_thankyou_redirect_url : null;

        return response()->json($this->payload($content, $funnel?->summit_id, $funnel?->id, $step->id, $wpUrl, $wpThankyouUrl, is_array($step->page_overrides) ? $step->page_overrides : null, $step->step_type));
    }

    /**
     * @param  array<string, mixed>  $content
     * @param  array<string, mixed>|null  $pageOverrides
     * @return array<string, mixed>
     */
    private function payload(array $content, ?string $summitId, ?string $funnelId, ?string $funnelStepId = null, ?string $wpCheckoutRedirectUrl = null, ?string $wpThankyouRedirectUrl = null, ?array $pageOverrides = null, ?string $stepType = null): array
    {
        $summit = $summitId ? Summit::query()->with('domain:id,meta_pixel_id')->find($summitId) : null;
        $speakers = $summit
            ? SpeakerResource::collection($summit->speakers()->get())->toArray(request())
            : [];

        $tokens = is_array($pageOverrides['tokens'] ?? null) ? $pageOverrides['tokens'] : null;
        $sections = is_array($pageOverrides['sections'] ?? null) ? $pageOverrides['sections'] : null;

        return [
            'template_key' => $content['template_key'],
            'content' => $content['content'] ?? [],
            'enabled_sections' => $content['enabled_sections'] ?? null,
            'tokens' => $tokens,
            'sections' => $sections,
            'speakers' => $speakers,
            'funnel_id' => $funnelId,
            'funnel_step_id' => $funnelStepId,
            'step_type' => $stepType,
            'summit_id' => $summitId,
            'wp_checkout_redirect_url' => $wpCheckoutRedirectUrl,
            'wp_thankyou_redirect_url' => $wpThankyouRedirectUrl,
            'meta_pixel_id' => $summit?->domain?->meta_pixel_id,
        ];
    }
}
