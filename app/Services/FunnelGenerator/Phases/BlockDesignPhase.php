<?php

namespace App\Services\FunnelGenerator\Phases;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class BlockDesignPhase
{
    /**
     * Two-stage per-section generation.
     *
     * Stage 1 asks gemini-3.1-flash-image-preview to produce a 1440x900 mockup
     * PNG for each section in parallel. Mockups are persisted under
     * storage/app/public/draft-mockups/{draftId}/{sectionId}.png so the
     * operator can inspect them (and the UI can retry from just the mockup).
     *
     * Stage 2 asks gemini-2.5-flash to implement each mockup as JSX via
     * /api/sections/generate, with the mockup attached as the visual target
     * and the Style Brief as the authoritative palette/typography constraints.
     *
     * If Stage 1 fails for a section we fall through to a reference-only call
     * (the summit's URL screenshot) so Stage 2 still has a visual anchor.
     *
     * @param  array<int, array{type:string,purpose:string,position:int,total:int}> $sectionBriefs
     * @param  array  $summitContext
     * @param  array  $styleBrief
     * @param  string|null  $referencePath  Storage-relative path to the summit's URL screenshot (optional)
     * @param  string  $draftId  Used to namespace the mockup PNG directory
     * @return array<int, array>
     */
    public function run(
        array $sectionBriefs,
        array $summitContext,
        array $styleBrief = [],
        ?string $referencePath = null,
        string $draftId = '',
    ): array {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        $refImage = $this->loadImage($referencePath);

        // Stage 1 — parallel image calls.
        $imageResponses = Http::pool(function ($pool) use ($sectionBriefs, $summitContext, $styleBrief, $refImage, $base, $token) {
            $out = [];
            foreach ($sectionBriefs as $i => $brief) {
                $out[] = $pool->as("img_{$i}")
                    ->withToken($token)
                    ->timeout(140)
                    ->post("{$base}/api/sections/design-image", [
                        'section' => $brief,
                        'summit' => $summitContext,
                        'styleBrief' => $styleBrief,
                        'referenceImage' => $refImage,
                    ]);
            }
            return $out;
        });

        // Persist mockups to disk, build the per-section mockup map.
        $mockups = [];
        foreach ($sectionBriefs as $i => $brief) {
            $resp = $imageResponses["img_{$i}"] ?? null;
            $sectionId = (string) Str::uuid();
            if ($resp instanceof Throwable) {
                Log::warning('BlockDesignPhase Stage 1 threw', [
                    'section' => $brief['type'] ?? null,
                    'error' => $resp->getMessage(),
                ]);
                $mockups[$i] = ['id' => $sectionId, 'image' => null, 'url' => null];
                continue;
            }
            if (! $resp?->successful()) {
                Log::warning('BlockDesignPhase Stage 1 non-2xx', [
                    'section' => $brief['type'] ?? null,
                    'status' => $resp?->status(),
                    'body' => substr((string) $resp?->body(), 0, 240),
                ]);
                $mockups[$i] = ['id' => $sectionId, 'image' => null, 'url' => null];
                continue;
            }
            if ($resp->json('status') !== 'ok') {
                Log::warning('BlockDesignPhase Stage 1 soft-fail', [
                    'section' => $brief['type'] ?? null,
                    'response' => substr($resp->body(), 0, 240),
                ]);
                $mockups[$i] = ['id' => $sectionId, 'image' => null, 'url' => null];
                continue;
            }
            $mime = $resp->json('mime') ?? 'image/png';
            $data = (string) $resp->json('base64');
            // Gemini returns JPEG or PNG; honour the MIME in the filename so
            // the browser renders the right content type.
            $ext = str_contains($mime, 'jpeg') ? 'jpg' : 'png';
            $path = $draftId !== ''
                ? "draft-mockups/{$draftId}/{$sectionId}.{$ext}"
                : "draft-mockups/transient/{$sectionId}.{$ext}";
            Storage::disk('public')->put($path, base64_decode($data));
            $mockups[$i] = [
                'id' => $sectionId,
                'image' => ['mime' => $mime, 'data' => $data],
                'url' => '/storage/' . $path,
            ];
        }

        // Stage 2 — parallel code calls, seeded with each mockup.
        $codeResponses = Http::pool(function ($pool) use ($sectionBriefs, $summitContext, $styleBrief, $mockups, $refImage, $base, $token) {
            $out = [];
            foreach ($sectionBriefs as $i => $brief) {
                $out[] = $pool->as("code_{$i}")
                    ->withToken($token)
                    ->timeout(180)
                    ->post("{$base}/api/sections/generate", [
                        'section' => $brief,
                        'summit' => $summitContext,
                        'previousSectionJsx' => null,
                        'styleBrief' => $styleBrief,
                        'mockupImage' => $mockups[$i]['image'] ?? null,
                        // When Stage 1 failed we still pass the reference
                        // screenshot so Stage 2 has *some* visual anchor.
                        'referenceImage' => ($mockups[$i]['image'] ?? null) ? null : $refImage,
                    ]);
            }
            return $out;
        });

        // Stitch together final sections (attach mockup_url + failure status).
        $sections = [];
        foreach ($sectionBriefs as $i => $brief) {
            $resp = $codeResponses["code_{$i}"] ?? null;
            $mockupUrl = $mockups[$i]['url'] ?? null;
            $hasMockup = (bool) ($mockups[$i]['image'] ?? null);

            if ($resp instanceof Throwable) {
                $stub = $this->failedStub(
                    $brief['type'],
                    'Request error: ' . substr($resp->getMessage(), 0, 240),
                );
                $stub['status'] = $hasMockup ? 'render_failed' : 'image_failed';
                $stub['mockup_url'] = $mockupUrl;
                $sections[] = $stub;
                continue;
            }
            if (! $resp?->successful()) {
                $stub = $this->failedStub(
                    $brief['type'],
                    "HTTP {$resp?->status()}: " . substr((string) $resp?->body(), 0, 240),
                );
                $stub['status'] = $hasMockup ? 'render_failed' : 'image_failed';
                $stub['mockup_url'] = $mockupUrl;
                $sections[] = $stub;
                continue;
            }

            $section = $resp->json();
            $section['mockup_url'] = $mockupUrl;
            if (! $hasMockup && ($section['status'] ?? null) !== 'failed') {
                $section['image_fallback'] = true;
            }
            // Only mark image_failed when the code actually failed too; if
            // Stage 2 salvaged the section off the reference image, leave its
            // own status intact (could be 'ready' or 'failed').
            if (! $hasMockup && ($section['status'] ?? null) === 'failed') {
                $section['status'] = 'image_failed';
            }
            $sections[] = $section;
        }

        return $sections;
    }

    public function regenerate(
        array $currentSection,
        array $summitContext,
        array $styleBrief = [],
        ?string $referencePath = null,
        string $draftId = '',
        ?string $note = null,
    ): array {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        $refImage = $this->loadImage($referencePath);
        $sectionBrief = [
            'type' => $currentSection['type'] ?? '',
            'purpose' => '',
            'position' => 0,
            'total' => 0,
        ];

        // Stage 1: mockup refresh
        $mockupImage = null;
        $mockupUrl = null;
        try {
            $imgResp = Http::withToken($token)
                ->timeout(140)
                ->post("{$base}/api/sections/design-image", [
                    'section' => $sectionBrief,
                    'summit' => $summitContext,
                    'styleBrief' => $styleBrief,
                    'referenceImage' => $refImage,
                ]);
            if ($imgResp->successful() && $imgResp->json('status') === 'ok') {
                $mockupImage = [
                    'mime' => $imgResp->json('mime') ?? 'image/png',
                    'data' => (string) $imgResp->json('base64'),
                ];
                $sectionId = $currentSection['id'] ?? (string) Str::uuid();
                $ext = str_contains($mockupImage['mime'], 'jpeg') ? 'jpg' : 'png';
                $path = $draftId !== ''
                    ? "draft-mockups/{$draftId}/{$sectionId}.{$ext}"
                    : "draft-mockups/transient/{$sectionId}.{$ext}";
                Storage::disk('public')->put($path, base64_decode($mockupImage['data']));
                $mockupUrl = '/storage/' . $path;
            }
        } catch (Throwable) {
            // Fall through to Stage 2 with just the reference image.
        }

        // Stage 2: code regenerate (preserve id)
        $resp = Http::withToken($token)
            ->timeout(180)
            ->post("{$base}/api/sections/regenerate", [
                'section' => $sectionBrief,
                'summit' => $summitContext,
                'styleBrief' => $styleBrief,
                'mockupImage' => $mockupImage,
                'referenceImage' => $mockupImage ? null : $refImage,
                'currentJsx' => $currentSection['jsx'] ?? null,
                'regenerationNote' => $note,
                'preserveId' => $currentSection['id'] ?? null,
            ]);

        if (! $resp->successful()) {
            $stub = $this->failedStub(
                $currentSection['type'] ?? '',
                "HTTP {$resp->status()}",
                $currentSection['id'] ?? null,
            );
            $stub['status'] = $mockupImage ? 'render_failed' : 'image_failed';
            $stub['mockup_url'] = $mockupUrl ?? ($currentSection['mockup_url'] ?? null);
            return $stub;
        }

        $section = $resp->json();
        $section['mockup_url'] = $mockupUrl ?? ($currentSection['mockup_url'] ?? null);
        return $section;
    }

    private function failedStub(string $type, string $error, ?string $preserveId = null): array
    {
        return [
            'id' => $preserveId ?? (string) Str::uuid(),
            'type' => $type,
            'jsx' => '',
            'fields' => [],
            'status' => 'failed',
            'regeneration_note' => null,
            'source_section_id' => null,
            'error' => $error,
        ];
    }

    private function loadImage(?string $path): ?array
    {
        if (! $path) return null;
        if (! Storage::disk('public')->exists($path)) return null;
        $bytes = Storage::disk('public')->get($path);
        if ($bytes === null) return null;
        return ['mime' => 'image/png', 'data' => base64_encode($bytes)];
    }
}
