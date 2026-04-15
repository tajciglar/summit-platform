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
            'anthropic-beta' => 'prompt-caching-2024-07-31',
        ])
            ->timeout(config('anthropic.timeout', 120))
            ->retry(
                config('anthropic.retries', 2) + 1,
                1000,
                when: fn (\Throwable $e) => $this->shouldRetry($e),
            )
            ->throw()
            ->post($this->messagesEndpoint(), $payload);

        return $response->json();
    }

    /**
     * Build the messages endpoint URL, defensively appending /v1 when the
     * configured base URL omits it (common when shell env leaks a bare
     * `https://api.anthropic.com` over the .env default).
     */
    private function messagesEndpoint(): string
    {
        $base = rtrim((string) config('anthropic.base_url'), '/');
        if (! preg_match('#/v\d+$#', $base)) {
            $base .= '/v1';
        }

        return $base.'/messages';
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
