<?php

use App\Filament\Forms\Components\MediaPickerField;
use App\Services\Templates\FilamentSchemaMapper;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Fieldset;

it('maps a plain object schema with scalar strings to TextInput components', function () {
    $schema = [
        'type' => 'object',
        'required' => ['name'],
        'properties' => [
            'name' => ['type' => 'string', 'minLength' => 1],
            'subtitle' => ['type' => 'string'],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components)->toHaveCount(2);
    expect($components[0])->toBeInstanceOf(TextInput::class);
    expect($components[1])->toBeInstanceOf(TextInput::class);
});

it('marks required scalar fields as required when enforceRequired is on', function () {
    $schema = [
        'type' => 'object',
        'required' => ['headline'],
        'properties' => [
            'headline' => ['type' => 'string', 'minLength' => 3],
            'optional' => ['type' => 'string'],
        ],
    ];

    $components = (new FilamentSchemaMapper(enforceRequired: true))->map($schema);

    expect($components[0]->isRequired())->toBeTrue();
    expect($components[1]->isRequired())->toBeFalse();
});

it('defaults to non-enforcing required so partial drafts can save', function () {
    $schema = [
        'type' => 'object',
        'required' => ['headline'],
        'properties' => [
            'headline' => ['type' => 'string'],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0]->isRequired())->toBeFalse();
});

it('uses Textarea for string fields with maxLength greater than 200', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'body' => ['type' => 'string', 'maxLength' => 1000],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(Textarea::class);
});

it('maps enum schemas to Select components with matching options', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'tone' => ['type' => 'string', 'enum' => ['serious', 'playful']],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(Select::class);
});

it('maps an array-of-objects schema to a Repeater with nested fields', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'faqs' => [
                'type' => 'array',
                'minItems' => 3,
                'items' => [
                    'type' => 'object',
                    'properties' => [
                        'question' => ['type' => 'string', 'minLength' => 1],
                        'answer' => ['type' => 'string', 'minLength' => 1],
                    ],
                ],
            ],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(Repeater::class);
});

it('maps an array-of-scalar-strings schema to a simple Repeater', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'tags' => [
                'type' => 'array',
                'items' => ['type' => 'string'],
            ],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(Repeater::class);
});

it('maps nested object schemas to Fieldsets with recursed children', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'cta' => [
                'type' => 'object',
                'properties' => [
                    'label' => ['type' => 'string'],
                    'href' => ['type' => 'string'],
                ],
            ],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(Fieldset::class);
});

it('returns an empty array when the schema is not an object', function () {
    expect((new FilamentSchemaMapper)->map(['type' => 'string']))->toBe([]);
    expect((new FilamentSchemaMapper)->map([]))->toBe([]);
});

it('unwraps Zod nullable enums (anyOf [enum, null]) and still maps to Select', function () {
    // `.nullable()` / `.optional().nullable()` in Zod exports as
    // `anyOf: [{ type: string, enum: [...] }, { type: null }]`. The mapper
    // must see through that to emit a Select instead of falling through to
    // a plain TextInput.
    $schema = [
        'type' => 'object',
        'properties' => [
            'eventStatus' => [
                'anyOf' => [
                    ['type' => 'string', 'enum' => ['before', 'live', 'ended']],
                    ['type' => 'null'],
                ],
            ],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(Select::class);
});

it('turns speaker-id arrays into a multi-select when a summit id is given', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'heroSpeakerIds' => [
                'type' => 'array',
                'minItems' => 1,
                'maxItems' => 4,
                'items' => [
                    'type' => 'string',
                    'format' => 'uuid',
                ],
            ],
        ],
    ];

    // summitId is a string but no speakers exist for it — still returns a Select.
    $components = (new FilamentSchemaMapper)->map($schema, '00000000-0000-0000-0000-000000000000');

    expect($components[0])->toBeInstanceOf(Select::class);
});

it('emits a MediaPickerField when the property carries x-media metadata', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'backgroundImageId' => [
                'anyOf' => [
                    ['type' => 'string', 'format' => 'uuid'],
                    ['type' => 'null'],
                ],
                'description' => json_encode([
                    'x-media' => [
                        'role' => 'hero-background',
                        'category' => 'hero',
                        'subCategory' => 'background',
                    ],
                ]),
            ],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components)->toHaveCount(1);
    expect($components[0])->toBeInstanceOf(MediaPickerField::class);
    expect($components[0]->getName())->toBe('backgroundImageId');
    expect($components[0]->getCategory())->toBe('hero');
    expect($components[0]->getRole())->toBe('hero-background');
    expect($components[0]->getSubCategoryFilter())->toBe('background');
});

it('emits a MediaPickerField without subCategory when none supplied', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'logoMediaId' => [
                'type' => 'string',
                'format' => 'uuid',
                'description' => json_encode([
                    'x-media' => ['role' => 'logo', 'category' => 'brand'],
                ]),
            ],
        ],
    ];

    $components = (new FilamentSchemaMapper)->map($schema);

    expect($components[0])->toBeInstanceOf(MediaPickerField::class);
    expect($components[0]->getSubCategoryFilter())->toBeNull();
});
