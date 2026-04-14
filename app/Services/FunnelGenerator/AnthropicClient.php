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
        ])
            ->timeout(config('anthropic.timeout', 120))
            ->retry(
                config('anthropic.retries', 2) + 1,
                1000,
                when: fn (\Throwable $e) => $this->shouldRetry($e),
            )
            ->throw()
            ->post(rtrim(config('anthropic.base_url'), '/').'/messages', $payload);

        return $response->json();
    }

    private function shouldRetry(\Throwable $exception): bool
    {
        if ($exception instanceof RequestException) {
            $status = $exception->response?->status() ?? 0;

            return $status >= 500 || $status === 429;
        }

        // Retry on network/connection errors (ConnectionException etc.)
        return true;
    }
}
