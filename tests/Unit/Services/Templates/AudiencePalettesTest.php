<?php

declare(strict_types=1);

use App\Enums\SummitAudience;
use App\Services\Templates\AudiencePalettes;

it('has a palette for every audience', function () {
    foreach (SummitAudience::cases() as $audience) {
        $palette = AudiencePalettes::paletteFor($audience);
        expect($palette)->toBeArray();
        expect(count($palette))->toBe(8);
    }
});

it('every palette carries the 8 universal tokens', function () {
    $expectedKeys = ['primary', 'primary-contrast', 'ink', 'paper', 'paper-alt', 'muted', 'accent', 'border'];

    foreach (SummitAudience::cases() as $audience) {
        $palette = AudiencePalettes::paletteFor($audience);
        foreach ($expectedKeys as $key) {
            expect($palette)->toHaveKey($key);
        }
    }
});

it('every palette value is a valid 7-char hex', function () {
    foreach (SummitAudience::cases() as $audience) {
        $palette = AudiencePalettes::paletteFor($audience);
        foreach ($palette as $token => $hex) {
            expect($hex)->toBeString();
            expect(strlen($hex))->toBe(7, "{$audience->value}.{$token} must be 7 chars; got '{$hex}'");
            expect($hex[0])->toBe('#');
            expect(preg_match('/^#[0-9a-fA-F]{6}$/', $hex))->toBe(1);
        }
    }
});

it('NEUTRAL palette carries all 8 tokens', function () {
    $expectedKeys = ['primary', 'primary-contrast', 'ink', 'paper', 'paper-alt', 'muted', 'accent', 'border'];
    foreach ($expectedKeys as $key) {
        expect(AudiencePalettes::NEUTRAL)->toHaveKey($key);
    }
});

it('paletteFor returns NEUTRAL when given null', function () {
    expect(AudiencePalettes::paletteFor(null))->toBe(AudiencePalettes::NEUTRAL);
});
