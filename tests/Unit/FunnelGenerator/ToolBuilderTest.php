<?php

use App\Services\FunnelGenerator\Tools\ToolBuilder;

it('builds one Claude tool per block — name, description and input_schema', function () {
    $catalog = [
        'blocks' => [
            [
                'type' => 'HeroWithCountdown',
                'version' => 1,
                'validOn' => ['optin'],
                'purpose' => 'Above-fold hero …',
                'schema' => ['type' => 'object', 'properties' => ['headline' => ['type' => 'string']], 'required' => ['headline']],
                'exampleProps' => ['headline' => 'Example'],
            ],
            [
                'type' => 'PaymentForm',
                'version' => 1,
                'validOn' => ['checkout'],
                'purpose' => '…',
                'schema' => ['type' => 'object', 'properties' => []],
                'exampleProps' => [],
            ],
        ],
    ];

    $tools = (new ToolBuilder())->toolsForStep($catalog, 'optin');

    expect($tools)->toHaveCount(1)
        ->and($tools[0]['name'])->toBe('emit_HeroWithCountdown')
        ->and($tools[0]['description'])->toContain('Above-fold hero')
        ->and($tools[0]['description'])->toContain('Example')
        ->and($tools[0]['input_schema'])->toBe([
            'type' => 'object',
            'properties' => ['headline' => ['type' => 'string']],
            'required' => ['headline'],
        ]);
});

it('builds an architect_funnel tool with per-step enum of valid block types', function () {
    $catalog = [
        'blocks' => [
            ['type' => 'HeroWithCountdown', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
            ['type' => 'OptinForm', 'version' => 1, 'validOn' => ['optin'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
            ['type' => 'PricingCard', 'version' => 1, 'validOn' => ['sales_page'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
            ['type' => 'ThankYouCard', 'version' => 1, 'validOn' => ['thank_you'], 'purpose' => '', 'schema' => ['type' => 'object'], 'exampleProps' => []],
        ],
    ];

    $tool = (new ToolBuilder())->architectTool($catalog, ['optin', 'sales_page', 'upsell', 'thank_you']);

    expect($tool['name'])->toBe('architect_funnel')
        ->and($tool['input_schema']['properties']['optin']['items']['enum'])
            ->toEqualCanonicalizing(['HeroWithCountdown', 'OptinForm'])
        ->and($tool['input_schema']['properties']['sales_page']['items']['enum'])
            ->toEqual(['PricingCard'])
        ->and($tool['input_schema']['properties']['upsell']['items']['enum'])->toBe([])
        ->and($tool['input_schema']['required'])
            ->toEqualCanonicalizing(['optin', 'sales_page', 'upsell', 'thank_you']);
});
