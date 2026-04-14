<?php

namespace App\Services\FunnelGenerator;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class AnthropicClient
{
    public function messages(array $payload): array
    {
        $response = Http::withHeaders([
            'x-api-key' => config('anthropic.api_key'),
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])
            ->timeout(config('anthropic.timeout', 120))
            ->retry(config('anthropic.retries', 2), 1000, throw: false)
            ->post(rtrim(config('anthropic.base_url'), '/').'/messages', $payload);

        if ($response->failed()) {
            throw new RequestException($response);
        }

        return $response->json();
    }
}
