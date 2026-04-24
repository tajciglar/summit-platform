<?php

use App\Enums\LandingPageDraftStatus;
use App\Http\Resources\LandingPageDraftResource;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('passes through nested template content unchanged', function () {
    $draft = makeDraftForResourceTest(['sections' => ['hero' => ['title' => 'Hi']]]);

    $result = (new LandingPageDraftResource($draft))->toArray(request());

    expect($result['content'])->toBe(['hero' => ['title' => 'Hi']]);
});

it('normalizes a flat list of Section-shaped items via SectionResource', function () {
    $draft = makeDraftForResourceTest([
        'sections' => [
            ['id' => 's1', 'type' => 'hero', 'jsx' => '<h1/>', 'fields' => []],
            ['id' => 's2', 'type' => 'price-card', 'jsx' => '<div/>', 'fields' => []],
        ],
    ]);

    $result = (new LandingPageDraftResource($draft))->toArray(request());

    expect($result['content'])->toHaveCount(2);
    expect($result['content'][0]['type'])->toBe('hero');
    expect($result['content'][0]['status'])->toBe('ready');
    expect($result['content'][1]['type'])->toBe('price-card');
});

it('includes funnel + status fields', function () {
    $draft = makeDraftForResourceTest([
        'sections' => [],
        'status' => LandingPageDraftStatus::Ready,
    ]);

    $result = (new LandingPageDraftResource($draft))->toArray(request());

    expect($result['status'])->toBe('ready');
    expect($result)->toHaveKeys(['funnel_id', 'wp_checkout_redirect_url', 'wp_thankyou_redirect_url']);
});

function makeDraftForResourceTest(array $overrides): LandingPageDraft
{
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    return LandingPageDraft::create(array_merge([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'template_key' => 'ochre-ink',
        'status' => 'ready',
        'preview_token' => 'tok-'.uniqid(),
    ], $overrides));
}
