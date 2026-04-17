<?php

use App\Services\Anthropic\AnthropicClient;
use Illuminate\Support\Facades\Http;

it('posts to the messages endpoint with the configured model and returns parsed content', function () {
    config()->set('services.anthropic.api_key', 'test-key');
    config()->set('services.anthropic.model', 'claude-opus-4-7');
    config()->set('services.anthropic.base_url', 'https://api.anthropic.com');
    config()->set('services.anthropic.max_tokens', 4096);

    Http::fake([
        'api.anthropic.com/v1/messages' => Http::response([
            'id' => 'msg_123',
            'type' => 'message',
            'role' => 'assistant',
            'model' => 'claude-opus-4-7',
            'content' => [['type' => 'text', 'text' => '{"hello":"world"}']],
            'stop_reason' => 'end_turn',
            'usage' => ['input_tokens' => 10, 'output_tokens' => 3],
        ], 200),
    ]);

    $client = app(AnthropicClient::class);
    $result = $client->complete(
        system: 'You are a JSON generator.',
        user: 'Return {"hello":"world"}',
    );

    expect($result['text'])->toBe('{"hello":"world"}');
    expect($result['tokens'])->toBe(13);

    Http::assertSent(function ($req) {
        return $req->hasHeader('x-api-key', 'test-key')
            && $req->hasHeader('anthropic-version', '2023-06-01')
            && $req['model'] === 'claude-opus-4-7'
            && $req['max_tokens'] === 4096;
    });
});

it('throws when Anthropic returns an error status', function () {
    config()->set('services.anthropic.api_key', 'test-key');
    Http::fake(['api.anthropic.com/v1/messages' => Http::response(['error' => 'rate_limited'], 429)]);

    expect(fn () => app(AnthropicClient::class)->complete(system: 's', user: 'u'))
        ->toThrow(\RuntimeException::class);
});
