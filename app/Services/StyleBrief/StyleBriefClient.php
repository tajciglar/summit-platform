<?php

namespace App\Services\StyleBrief;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class StyleBriefClient
{
    /**
     * @param  string  $summitId  Used as the storage subdir for the reference PNG
     * @param  string  $url       Public URL whose screenshot feeds the vision model
     * @param  array   $summitContext  Voice/tone/speaker hints
     * @return array{status:string, brief?:array, reference_path?:string, error?:string}
     */
    public function build(string $summitId, string $url, array $summitContext): array
    {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');

        /** @var Response $resp */
        $resp = Http::withToken($token)
            ->timeout(140)
            ->post("{$base}/api/style-briefs/build", [
                'url' => $url,
                'summit_context' => $summitContext,
            ]);

        if (! $resp->successful()) {
            return [
                'status' => 'failed_vision',
                'error' => "HTTP {$resp->status()}: " . substr($resp->body(), 0, 240),
            ];
        }

        $data = $resp->json() ?? [];

        // Save the reference screenshot to local storage (symlinked to public/).
        if (! empty($data['reference_png_base64'])) {
            $path = "style-briefs/{$summitId}/reference.png";
            Storage::disk('public')->put($path, base64_decode($data['reference_png_base64']));
            $data['reference_path'] = $path;
            unset($data['reference_png_base64']);
        }
        unset($data['reference_png_mime']);

        return $data;
    }
}
