<?php

namespace App\Services\FunnelGenerator\Phases;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BlockDesignPhase
{
    public function run(array $sectionBriefs, array $summitContext): array
    {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');

        $responses = Http::pool(function ($pool) use ($sectionBriefs, $summitContext, $base, $token) {
            $out = [];
            foreach ($sectionBriefs as $i => $brief) {
                $out[] = $pool->as("s_{$i}")
                    ->withToken($token)
                    ->timeout(90)
                    ->post("{$base}/api/sections/generate", [
                        'section' => $brief,
                        'summit' => $summitContext,
                        'previousSectionJsx' => null,
                    ]);
            }
            return $out;
        });

        $sections = [];
        foreach ($sectionBriefs as $i => $_) {
            $resp = $responses["s_{$i}"];
            if (!$resp->successful()) {
                $sections[] = $this->failedStub($sectionBriefs[$i]['type'], "HTTP {$resp->status()}");
                continue;
            }
            $sections[] = $resp->json();
        }
        return $sections;
    }

    public function regenerate(array $currentSection, array $summitContext, ?string $note): array
    {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        $resp = Http::withToken($token)->timeout(90)->post("{$base}/api/sections/regenerate", [
            'section' => ['type' => $currentSection['type'], 'purpose' => '', 'position' => 0, 'total' => 0],
            'summit' => $summitContext,
            'currentJsx' => $currentSection['jsx'] ?? null,
            'regenerationNote' => $note,
            'preserveId' => $currentSection['id'],
        ]);
        if (!$resp->successful()) {
            return $this->failedStub($currentSection['type'], "HTTP {$resp->status()}", $currentSection['id']);
        }
        return $resp->json();
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
}
