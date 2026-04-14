<?php

use App\Services\FunnelGenerator\AnthropicClient;
use Illuminate\Support\Facades\Http;

it('posts to /messages with API key and returns decoded body', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.base_url', 'https://api.anthropic.com/v1');

    Http::fake([
        'https://api.anthropic.com/v1/messages' => Http::response([
            'id' => 'msg_1',
            'content' => [['type' => 'text', 'text' => 'hello']],
            'stop_reason' => 'end_turn',
        ], 200),
    ]);

    $client = new AnthropicClient();
    $response = $client->messages([
        'model' => 'claude-opus-4-6',
        'max_tokens' => 100,
        'messages' => [['role' => 'user', 'content' => 'hi']],
    ]);

    expect($response['id'])->toBe('msg_1');

    Http::assertSent(function ($req) {
        return $req->hasHeader('x-api-key', 'test-key')
            && $req->hasHeader('anthropic-version', '2023-06-01')
            && $req['model'] === 'claude-opus-4-6';
    });
});
