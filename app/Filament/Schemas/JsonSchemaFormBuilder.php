<?php

namespace App\Filament\Schemas;

use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Component;

class JsonSchemaFormBuilder
{
    /**
     * @return Component[]
     */
    public static function build(array $schema): array
    {
        $required = $schema['required'] ?? [];
        $properties = $schema['properties'] ?? [];
        $fields = [];

        foreach ($properties as $name => $spec) {
            $field = self::fieldFor($name, $spec, in_array($name, $required, true));
            if ($field !== null) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    private static function fieldFor(string $name, array $spec, bool $required): ?Component
    {
        $label = ucfirst(preg_replace('/([A-Z])/', ' $1', $name));

        if (isset($spec['enum']) && is_array($spec['enum'])) {
            $options = array_combine($spec['enum'], $spec['enum']);

            return Select::make($name)->label($label)->options($options)->required($required);
        }

        if (($spec['format'] ?? null) === 'rich-text') {
            return RichEditor::make($name)->label($label)->required($required);
        }

        if (($spec['type'] ?? null) === 'array') {
            return self::arrayField($name, $spec, $required, $label);
        }

        return match ($spec['type'] ?? null) {
            'string' => self::stringField($name, $spec, $required, $label),
            'number', 'integer' => TextInput::make($name)->label($label)->numeric()->required($required),
            'boolean' => Toggle::make($name)->label($label),
            default => null,
        };
    }

    private static function stringField(string $name, array $spec, bool $required, string $label): Component
    {
        $maxLength = $spec['maxLength'] ?? null;

        if ($maxLength && $maxLength > 200) {
            return Textarea::make($name)
                ->label($label)
                ->required($required)
                ->maxLength($maxLength)
                ->rows(4);
        }

        return TextInput::make($name)
            ->label($label)
            ->required($required)
            ->maxLength($maxLength);
    }

    private static function arrayField(string $name, array $spec, bool $required, string $label): Component
    {
        $items = $spec['items'] ?? [];

        if (($items['type'] ?? null) === 'integer' || ($items['type'] ?? null) === 'number') {
            return Select::make($name)
                ->label($label)
                ->multiple()
                ->required($required)
                ->placeholder('Select options…');
        }

        if (($items['type'] ?? null) === 'object') {
            $nested = self::build($items);

            return Repeater::make($name)
                ->label($label)
                ->required($required)
                ->schema($nested)
                ->collapsed();
        }

        return Repeater::make($name)
            ->label($label)
            ->required($required)
            ->schema([TextInput::make('value')->required()]);
    }
}
