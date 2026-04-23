<?php

use App\Support\CheckoutPrefillToken;
use Illuminate\Support\Carbon;

it('round-trips email + first_name through an encrypted token', function () {
    $token = CheckoutPrefillToken::issue('user@example.com', 'Jane');

    $payload = CheckoutPrefillToken::read($token);

    expect($payload)->toBe([
        'email' => 'user@example.com',
        'first_name' => 'Jane',
    ]);
});

it('returns null for an expired token', function () {
    $token = CheckoutPrefillToken::issue('user@example.com', 'Jane');

    Carbon::setTestNow(now()->addMinutes(31));

    expect(CheckoutPrefillToken::read($token))->toBeNull();

    Carbon::setTestNow();
});

it('returns null for a tampered token', function () {
    $token = CheckoutPrefillToken::issue('user@example.com', 'Jane');
    // Mutate a character in the middle of the ciphertext body so the MAC
    // fails, not just the base64 decode.
    $tampered = substr_replace($token, 'ZZZZ', intdiv(strlen($token), 2), 4);

    expect(CheckoutPrefillToken::read($tampered))->toBeNull();
    expect(CheckoutPrefillToken::read('not-a-token'))->toBeNull();
});

it('does not expose email or first_name inside the token string', function () {
    $token = CheckoutPrefillToken::issue('secret@example.com', 'Alice');

    expect($token)->not->toContain('secret@example.com');
    expect($token)->not->toContain('Alice');
});
