<?php

use App\Models\FunnelGeneration;
use App\Models\Summit;
use App\Services\Blocks\BlockCatalogService;
use App\Services\FunnelGenerator\FunnelGenerator;
use Illuminate\Support\Facades\Http;

it('runs architect + copywriters and persists funnel', function () {
    config()->set('anthropic.api_key', 'test-key');
    $summit = Summit::factory()->create(['title' => 'ADHD', 'slug' => 'adhd-2026']);

    $catalog = [
        'version' => '2026-04-14',
        'blocks' => [
            ['type' => 'HeroWithCountdown', 'category' => 'hero', 'version' => 1, 'validOn' => ['optin'], 'purpose' => 'p', 'exampleProps' => [],
             'schema' => ['type' => 'object', 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]], 'required' => ['headline']]],
            ['type' => 'OptinForm', 'category' => 'form-cta', 'version' => 1, 'validOn' => ['optin'], 'purpose' => 'p', 'exampleProps' => [],
             'schema' => ['type' => 'object', 'properties' => ['buttonText' => ['type' => 'string', 'minLength' => 1]], 'required' => ['buttonText']]],
            ['type' => 'PricingCard', 'category' => 'content', 'version' => 1, 'validOn' => ['sales_page'], 'purpose' => 'p', 'exampleProps' => [],
             'schema' => ['type' => 'object', 'properties' => ['price' => ['type' => 'number']], 'required' => ['price']]],
            ['type' => 'ThankYouCard', 'category' => 'content', 'version' => 1, 'validOn' => ['thank_you'], 'purpose' => 'p', 'exampleProps' => [],
             'schema' => ['type' => 'object', 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]], 'required' => ['headline']]],
        ],
    ];

    $this->mock(BlockCatalogService::class, fn ($m) => $m->shouldReceive('current')->andReturn($catalog));

    Http::fakeSequence('https://api.anthropic.com/v1/messages')
        // architect
        ->push(['content' => [['type' => 'tool_use', 'id' => 'a', 'name' => 'architect_funnel', 'input' => [
            'optin' => ['HeroWithCountdown', 'OptinForm'],
            'sales_page' => ['PricingCard'],
            'upsell' => [],
            'thank_you' => ['ThankYouCard'],
        ]]]], 200)
        // optin copywriter
        ->push(['content' => [
            ['type' => 'tool_use', 'id' => '1', 'name' => 'emit_HeroWithCountdown', 'input' => ['headline' => 'Summit']],
            ['type' => 'tool_use', 'id' => '2', 'name' => 'emit_OptinForm', 'input' => ['buttonText' => 'Join']],
        ]], 200)
        // sales_page copywriter
        ->push(['content' => [
            ['type' => 'tool_use', 'id' => '3', 'name' => 'emit_PricingCard', 'input' => ['price' => 97]],
        ]], 200)
        // upsell = empty sequence → no HTTP call
        // thank_you copywriter
        ->push(['content' => [
            ['type' => 'tool_use', 'id' => '4', 'name' => 'emit_ThankYouCard', 'input' => ['headline' => 'Thanks!']],
        ]], 200);

    $generation = FunnelGeneration::create([
        'summit_id' => $summit->id,
        'status' => 'queued',
        'progress' => 0,
        'brief' => ['summit_name' => 'ADHD', 'audience' => 'parents'],
    ]);

    app(FunnelGenerator::class)->generate($generation);

    $generation->refresh();
    expect($generation->status)->toBe('completed')
        ->and($generation->progress)->toBe(100)
        ->and($generation->funnel_id)->not->toBeNull();

    $funnel = $generation->funnel;
    expect($funnel->steps)->toHaveCount(3);
    $optin = $funnel->steps->firstWhere('step_type', 'optin');
    expect($optin->content['blocks'][0]['type'])->toBe('HeroWithCountdown')
        ->and($optin->content['blocks'][0]['props']['headline'])->toBe('Summit');
})->group('database');
