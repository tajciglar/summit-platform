<?php

namespace App\Services\Anthropic;

use Illuminate\Support\Facades\Http;

class AnthropicClient
{
    /**
     * @return array{text: string, tokens: int}
     * @throws \RuntimeException on non-2xx response
     */
    public function complete(string $system, string $user): array
    {
        $config = config('services.anthropic');

        $response = Http::timeout(120)
            ->withHeaders([
                'x-api-key' => $config['api_key'],
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->post($config['base_url'].'/v1/messages', [
                'model' => $config['model'],
                'max_tokens' => $config['max_tokens'],
                'system' => $system,
                'messages' => [
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                "Anthropic API returned {$response->status()}: ".$response->body()
            );
        }

        $data = $response->json();
        $text = collect($data['content'] ?? [])
            ->where('type', 'text')
            ->pluck('text')
            ->implode('');

        return [
            'text' => $text,
            'tokens' => ($data['usage']['input_tokens'] ?? 0) + ($data['usage']['output_tokens'] ?? 0),
        ];
    }
}
