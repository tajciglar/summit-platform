<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FunnelForgeService
{
    private string $baseUrl;

    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.funnelforge.url', 'http://localhost:3333'), '/');
        $this->timeout = config('services.funnelforge.timeout', 120);
    }

    /**
     * Generate funnel content (blocking call — can take 30-90s).
     *
     * @param  array{eventType?: string, eventName: string, targetAudience: string, vipPrice?: int, numDays?: int, numSpeakers?: int, model?: string, language?: string}  $params
     * @return array The generated content record
     *
     * @throws ConnectionException|\Illuminate\Http\Client\RequestException
     */
    public function generate(array $params): array
    {
        $response = $this->request('POST', '/generate', $params);

        return $response->json();
    }

    /**
     * List available event types from FunnelForge.
     */
    public function eventTypes(): array
    {
        return $this->request('GET', '/event-types')->json();
    }

    /**
     * Check if FunnelForge is reachable.
     */
    public function healthy(): bool
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl.'/event-types');

            return $response->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    private function request(string $method, string $path, array $data = []): Response
    {
        $response = Http::timeout($this->timeout)
            ->acceptJson()
            ->$method($this->baseUrl.$path, $data);

        if ($response->failed()) {
            Log::error('FunnelForge request failed', [
                'path' => $path,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        $response->throw();

        return $response;
    }
}
