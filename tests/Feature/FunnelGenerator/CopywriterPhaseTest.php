<?php

use App\Services\FunnelGenerator\Phases\CopywriterPhase;
use Illuminate\Support\Facades\Http;

it('returns validated block array in emission order', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.copywriter_model', 'claude-opus-4-6');

    Http::fake([
        'https://api.anthropic.com/v1/messages' => Http::response([
            'stop_reason' => 'tool_use',
            'content' => [
                ['type' => 'text', 'text' => 'Calling tools.'],
                ['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'emit_HeroWithCountdown', 'input' => ['headline' => 'Join the Summit']],
                ['type' => 'tool_use', 'id' => 'tu_2', 'name' => 'emit_OptinForm', 'input' => ['buttonText' => 'Register']],
            ],
        ], 200),
    ]);

    $catalog = [
        'blocks' => [
            [
                'type' => 'HeroWithCountdown', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '',
                'schema' => ['type' => 'object', 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]], 'required' => ['headline']],
                'exampleProps' => ['headline' => 'Ex'],
            ],
            [
                'type' => 'OptinForm', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '',
                'schema' => ['type' => 'object', 'properties' => ['buttonText' => ['type' => 'string', 'minLength' => 1]], 'required' => ['buttonText']],
                'exampleProps' => ['buttonText' => 'Go'],
            ],
        ],
    ];

    $blocks = app(CopywriterPhase::class)->run(
        brief: ['summit_name' => 'ADHD Parenting Summit 2026'],
        catalog: $catalog,
        stepType: 'optin',
        sequence: ['HeroWithCountdown', 'OptinForm'],
    );

    expect($blocks)->toBe([
        ['type' => 'HeroWithCountdown', 'version' => 1, 'props' => ['headline' => 'Join the Summit']],
        ['type' => 'OptinForm', 'version' => 1, 'props' => ['buttonText' => 'Register']],
    ]);
});

it('returns [] without calling Anthropic when sequence is empty', function () {
    config()->set('anthropic.api_key', 'test-key');

    Http::fake(); // no expectations — any HTTP call would fail

    $blocks = app(\App\Services\FunnelGenerator\Phases\CopywriterPhase::class)->run(
        brief: [], catalog: ['blocks' => []], stepType: 'upsell', sequence: [],
    );

    expect($blocks)->toBe([]);
    Http::assertNothingSent();
});
