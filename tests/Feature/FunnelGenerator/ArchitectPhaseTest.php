<?php

use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use Illuminate\Support\Facades\Http;

it('returns block sequence keyed by step type', function () {
    config()->set('anthropic.api_key', 'test-key');
    config()->set('anthropic.architect_model', 'claude-opus-4-6');

    Http::fake([
        'https://api.anthropic.com/v1/messages' => Http::response([
            'id' => 'msg_x',
            'stop_reason' => 'tool_use',
            'content' => [[
                'type' => 'tool_use',
                'id' => 'tu_1',
                'name' => 'architect_funnel',
                'input' => [
                    'optin' => ['HeroWithCountdown', 'OptinForm'],
                    'sales_page' => ['PricingCard'],
                    'upsell' => [],
                    'thank_you' => ['ThankYouCard'],
                ],
            ]],
        ], 200),
    ]);

    $catalog = [
        'blocks' => [
            ['type' => 'HeroWithCountdown', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
            ['type' => 'OptinForm', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
            ['type' => 'PricingCard', 'version' => 1, 'validOn' => ['sales_page'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
            ['type' => 'ThankYouCard', 'version' => 1, 'validOn' => ['thank_you'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
        ],
    ];

    $sequence = app(ArchitectPhase::class)->run(
        brief: [
            'summit_name' => 'ADHD Parenting Summit 2026',
            'audience' => 'parents of kids with ADHD',
            'tone' => 'warm, empathetic',
            'speaker_count' => 37,
            'start_date' => '2026-06-01',
            'price_vip' => 97,
        ],
        catalog: $catalog,
        stepTypes: ['optin', 'sales_page', 'upsell', 'thank_you'],
    );

    expect($sequence)->toBe([
        'optin' => ['HeroWithCountdown', 'OptinForm'],
        'sales_page' => ['PricingCard'],
        'upsell' => [],
        'thank_you' => ['ThankYouCard'],
    ]);
});

it('throws ArchitectException if Claude returns text-only response', function () {
    config()->set('anthropic.api_key', 'test-key');

    Http::fake([
        'https://api.anthropic.com/v1/messages' => Http::response([
            'content' => [['type' => 'text', 'text' => 'I refuse.']],
            'stop_reason' => 'end_turn',
        ], 200),
    ]);

    app(\App\Services\FunnelGenerator\Phases\ArchitectPhase::class)->run(
        brief: ['summit_name' => 'x'],
        catalog: ['blocks' => []],
        stepTypes: ['optin'],
    );
})->throws(\App\Services\FunnelGenerator\Exceptions\ArchitectException::class);
