<?php

use App\Models\Summit;
use App\Services\FunnelGenerator\FunnelBlockMapper;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('persists a funnel with steps and V2 block shape', function () {
    $summit = Summit::factory()->create(['title' => 'Test Summit', 'slug' => 'test-summit']);

    $output = [
        'optin' => [
            ['type' => 'HeroWithCountdown', 'version' => 1, 'props' => ['headline' => 'H']],
            ['type' => 'OptinForm', 'version' => 1, 'props' => ['buttonText' => 'Go']],
        ],
        'sales_page' => [
            ['type' => 'PricingCard', 'version' => 1, 'props' => ['price' => 97]],
        ],
        'upsell' => [],
        'thank_you' => [
            ['type' => 'ThankYouCard', 'version' => 1, 'props' => ['headline' => 'Thanks']],
        ],
    ];

    $funnel = (new FunnelBlockMapper())->persist($summit, 'AI-Generated Funnel', $output);

    expect($funnel->summit_id)->toBe($summit->id)
        ->and($funnel->steps)->toHaveCount(3); // upsell empty → skipped

    $optin = $funnel->steps->firstWhere('step_type', 'optin');
    expect($optin->content['blocks'])->toEqual($output['optin']);
})->group('database');
