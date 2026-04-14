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

it('retries a single block with error feedback when validation fails', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.copywriter_model', 'claude-opus-4-6');

    Http::fakeSequence('https://api.anthropic.com/v1/messages')
        ->push([
            'stop_reason' => 'tool_use',
            'content' => [
                ['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'emit_HeroWithCountdown', 'input' => ['headline' => '']], // invalid — minLength 1
            ],
        ], 200)
        ->push([
            'stop_reason' => 'tool_use',
            'content' => [
                ['type' => 'tool_use', 'id' => 'tu_2', 'name' => 'emit_HeroWithCountdown', 'input' => ['headline' => 'Fixed Headline']],
            ],
        ], 200);

    $catalog = [
        'blocks' => [[
            'type' => 'HeroWithCountdown', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '',
            'schema' => ['type' => 'object', 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]], 'required' => ['headline']],
            'exampleProps' => ['headline' => 'Ex'],
        ]],
    ];

    $blocks = app(\App\Services\FunnelGenerator\Phases\CopywriterPhase::class)->run(
        brief: ['summit_name' => 'x'], catalog: $catalog, stepType: 'optin', sequence: ['HeroWithCountdown'],
    );

    expect($blocks[0]['props']['headline'])->toBe('Fixed Headline');
    Http::assertSentCount(2);
});

it('throws CopywriterException (not InvalidPropsException) when retry also returns invalid props', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.copywriter_model', 'claude-opus-4-6');

    // Both calls return invalid headline = ''
    Http::fakeSequence('https://api.anthropic.com/v1/messages')
        ->push([
            'stop_reason' => 'tool_use',
            'content' => [['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'emit_HeroWithCountdown', 'input' => ['headline' => '']]],
        ], 200)
        ->push([
            'stop_reason' => 'tool_use',
            'content' => [['type' => 'tool_use', 'id' => 'tu_2', 'name' => 'emit_HeroWithCountdown', 'input' => ['headline' => '']]],
        ], 200);

    $catalog = [
        'blocks' => [[
            'type' => 'HeroWithCountdown', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '',
            'schema' => ['type' => 'object', 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]], 'required' => ['headline']],
            'exampleProps' => [],
        ]],
    ];

    expect(fn () => app(\App\Services\FunnelGenerator\Phases\CopywriterPhase::class)->run(
        brief: [], catalog: $catalog, stepType: 'optin', sequence: ['HeroWithCountdown'],
    ))->toThrow(\App\Services\FunnelGenerator\Exceptions\CopywriterException::class);
});
