<?php

use App\Filament\Schemas\JsonSchemaFormBuilder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

it('maps string property to TextInput', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['headline' => ['type' => 'string']],
        'required' => ['headline'],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields)->toHaveCount(1);
    expect($fields[0])->toBeInstanceOf(TextInput::class);
    expect($fields[0]->getName())->toBe('headline');
    expect($fields[0]->isRequired())->toBeTrue();
});

it('maps long string (maxLength > 200) to Textarea', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['body' => ['type' => 'string', 'maxLength' => 500]],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields[0])->toBeInstanceOf(Textarea::class);
});

it('maps enum to Select', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['style' => ['type' => 'string', 'enum' => ['a', 'b', 'c']]],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields[0])->toBeInstanceOf(Select::class);
});

it('maps boolean to Toggle', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['showCta' => ['type' => 'boolean']],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields[0])->toBeInstanceOf(Toggle::class);
});
