<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

it('refreshes the catalog when given the correct token', function () {
    config(['block_catalog.refresh_token' => 'secret-token']);
    config(['block_catalog.bunny_hostname' => 'cdn.example.com']);

    Http::fake([
        'https://cdn.example.com/*' => Http::response([
            'version' => '2026-04-13-2',
            'blocks' => [],
        ]),
    ]);

    $response = $this->postJson('/api/admin/catalog/refresh', [], [
        'Authorization' => 'Bearer secret-token',
    ]);

    $response->assertOk()->assertJsonPath('version', '2026-04-13-2');
});

it('rejects refresh without token', function () {
    config(['block_catalog.refresh_token' => 'secret-token']);

    $response = $this->postJson('/api/admin/catalog/refresh');
    $response->assertForbidden();
});
