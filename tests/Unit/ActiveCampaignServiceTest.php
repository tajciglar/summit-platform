<?php

use App\Services\ActiveCampaignService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.activecampaign.url' => 'https://test.api-us1.com',
        'services.activecampaign.key' => 'test-key',
    ]);
});

it('finds existing tag by name', function () {
    Http::fake([
        'test.api-us1.com/api/3/tags*' => Http::response([
            'tags' => [['id' => '42', 'tag' => 'ATS1 APR26 SIGNUP']],
        ]),
    ]);

    $service = new ActiveCampaignService;
    $tagId = $service->findOrCreateTagByName('ATS1 APR26 SIGNUP');

    expect($tagId)->toBe('42');
});

it('creates tag when not found', function () {
    Http::fake([
        'test.api-us1.com/api/3/tags?search=*' => Http::response(['tags' => []]),
        'test.api-us1.com/api/3/tags' => Http::response(['tag' => ['id' => '99']]),
    ]);

    $service = new ActiveCampaignService;
    $tagId = $service->findOrCreateTagByName('NEW TAG');

    expect($tagId)->toBe('99');
    Http::assertSent(fn ($request) => $request->url() === 'https://test.api-us1.com/api/3/tags'
        && $request->method() === 'POST'
        && $request['tag']['tag'] === 'NEW TAG'
        && $request['tag']['tagType'] === 'contact'
    );
});

it('adds contact to list', function () {
    Http::fake([
        'test.api-us1.com/api/3/contactLists' => Http::response(['contactList' => ['id' => '1']]),
    ]);

    $service = new ActiveCampaignService;
    $service->addContactToList('55', '7');

    Http::assertSent(fn ($request) => $request->url() === 'https://test.api-us1.com/api/3/contactLists'
        && $request['contactList']['contact'] === '55'
        && $request['contactList']['list'] === '7'
        && $request['contactList']['status'] === 1
    );
});
