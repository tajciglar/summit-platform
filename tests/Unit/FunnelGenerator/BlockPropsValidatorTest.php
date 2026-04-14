<?php

use App\Services\FunnelGenerator\Exceptions\InvalidPropsException;
use App\Services\FunnelGenerator\Validators\BlockPropsValidator;

it('returns true when props satisfy JSON Schema', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'headline' => ['type' => 'string', 'minLength' => 1],
            'ctaLabel' => ['type' => 'string'],
        ],
        'required' => ['headline'],
    ];

    expect((new BlockPropsValidator())->validate($schema, ['headline' => 'Hi', 'ctaLabel' => 'Go']))
        ->toBeTrue();
});

it('throws InvalidPropsException with structured errors for invalid props', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]],
        'required' => ['headline'],
    ];

    try {
        (new BlockPropsValidator())->validate($schema, ['headline' => '']);
        throw new RuntimeException('should have thrown');
    } catch (InvalidPropsException $e) {
        expect($e->errors())->not->toBeEmpty();
        expect($e->getMessage())->toContain('headline');
    }
});
