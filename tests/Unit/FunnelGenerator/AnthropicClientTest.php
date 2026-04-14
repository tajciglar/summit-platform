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

it('forwards tools and tool_choice to the API body verbatim', function () {
    config()->set('anthropic.api_key', 'test-key');

    Http::fake([
        'https://api.anthropic.com/v1/messages' => Http::response(['content' => []], 200),
    ]);

    (new AnthropicClient())->messages([
        'model' => 'claude-opus-4-6',
        'max_tokens' => 100,
        'messages' => [['role' => 'user', 'content' => 'x']],
        'tools' => [['name' => 't', 'description' => 'd', 'input_schema' => ['type' => 'object']]],
        'tool_choice' => ['type' => 'tool', 'name' => 't'],
    ]);

    Http::assertSent(fn ($req) =>
        is_array($req['tools']) && $req['tools'][0]['name'] === 't'
        && $req['tool_choice']['name'] === 't');
});

it('retries on 5xx responses up to configured attempts', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.base_url', 'https://api.anthropic.com/v1');
    config()->set('anthropic.retries', 2);

    Http::fakeSequence('https://api.anthropic.com/v1/messages')
        ->push(['error' => 'overloaded'], 529)
        ->push(['error' => 'overloaded'], 529)
        ->push(['id' => 'msg_2', 'content' => [], 'stop_reason' => 'end_turn'], 200);

    $response = (new \App\Services\FunnelGenerator\AnthropicClient())->messages([
        'model' => 'claude-opus-4-6',
        'max_tokens' => 100,
        'messages' => [['role' => 'user', 'content' => 'hi']],
    ]);

    expect($response['id'])->toBe('msg_2');
    Http::assertSentCount(3); // initial + 2 retries
});

it('does not retry on 4xx responses', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.base_url', 'https://api.anthropic.com/v1');
    config()->set('anthropic.retries', 2);

    Http::fakeSequence('https://api.anthropic.com/v1/messages')
        ->push(['error' => 'bad request'], 400);

    expect(fn () => (new \App\Services\FunnelGenerator\AnthropicClient())->messages([
        'model' => 'claude-opus-4-6',
        'max_tokens' => 100,
        'messages' => [['role' => 'user', 'content' => 'hi']],
    ]))->toThrow(\Illuminate\Http\Client\RequestException::class);

    Http::assertSentCount(1); // no retries on 4xx
});

it('sends anthropic-beta prompt-caching header', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.base_url', 'https://api.anthropic.com/v1');

    Http::fake(['https://api.anthropic.com/v1/messages' => Http::response(['content' => []], 200)]);

    (new \App\Services\FunnelGenerator\AnthropicClient())->messages([
        'model' => 'claude-opus-4-6',
        'max_tokens' => 100,
        'messages' => [['role' => 'user', 'content' => 'hi']],
    ]);

    Http::assertSent(fn ($req) => $req->hasHeader('anthropic-beta', 'prompt-caching-2024-07-31'));
});
