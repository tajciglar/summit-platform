<?php

use App\Support\CheckoutPrefillToken;

beforeEach(fn () => test()->withHeaders(withInternalApiToken()));

it('returns the decoded prefill for a valid token', function () {
    $token = CheckoutPrefillToken::issue('user@example.com', 'Jane');

    $this->getJson('/api/optin/prefill/'.urlencode($token))
        ->assertOk()
        ->assertJson([
            'email' => 'user@example.com',
            'first_name' => 'Jane',
        ]);
});

it('returns 404 for a tampered or expired token', function () {
    $this->getJson('/api/optin/prefill/not-a-real-token')
        ->assertStatus(404);
});

it('is protected by the internal-api middleware', function () {
    $token = CheckoutPrefillToken::issue('user@example.com', 'Jane');
    // Overwrite the Authorization header with no token (empty bearer).
    $this->withHeaders(['Authorization' => 'Bearer '])
        ->getJson('/api/optin/prefill/'.urlencode($token))
        ->assertStatus(401);
});
