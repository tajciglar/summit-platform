<?php

namespace App\Services;

use App\Enums\BlockType;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class BlockSchemaExporter
{
    /**
     * Export all block type schemas as JSON-serializable array.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public static function export(): array
    {
        $schemas = [];

        foreach (BlockType::cases() as $blockType) {
            $schemas[$blockType->value] = array_map(
                fn ($field) => self::fieldToDescriptor($field),
                $blockType->filamentFields()
            );
        }

        return $schemas;
    }

    /**
     * Export metadata for all block types (label, icon, value).
     */
    public static function exportBlockTypes(): array
    {
        return array_map(fn (BlockType $bt) => [
            'value' => $bt->value,
            'label' => $bt->label(),
            'icon' => $bt->icon(),
        ], BlockType::cases());
    }

    protected static function fieldToDescriptor(mixed $field): array
    {
        $descriptor = [
            'name' => $field->getName(),
            'label' => self::safeCall(fn () => $field->getLabel()) ?? ucfirst(str_replace('_', ' ', $field->getName())),
        ];

        // Determine type from class
        $descriptor['type'] = match (true) {
            $field instanceof RichEditor => 'richtext',
            $field instanceof Textarea => 'textarea',
            $field instanceof TextInput => self::textInputType($field),
            $field instanceof FileUpload => 'image',
            $field instanceof Select => 'select',
            $field instanceof Toggle => 'toggle',
            $field instanceof Repeater => 'repeater',
            default => 'text',
        };

        // Required
        $descriptor['required'] = (bool) self::safeCall(fn () => $field->isRequired(), false);

        // Default
        $default = self::safeCall(fn () => $field->getDefaultState());
        if ($default !== null) {
            $descriptor['default'] = $default;
        }

        // Placeholder
        $placeholder = self::safeCall(fn () => $field->getPlaceholder());
        if ($placeholder) {
            $descriptor['placeholder'] = $placeholder;
        }

        // MaxLength
        if ($field instanceof TextInput) {
            $maxLength = self::safeCall(fn () => $field->getMaxLength());
            if ($maxLength) {
                $descriptor['maxLength'] = $maxLength;
            }
        }

        // Select options
        if ($field instanceof Select) {
            $options = self::safeCall(fn () => $field->getOptions(), []);
            if (is_array($options) && ! empty($options)) {
                $descriptor['options'] = collect($options)
                    ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                    ->values()
                    ->all();
            }
        }

        // Repeater schema
        if ($field instanceof Repeater) {
            $childComponents = self::safeCall(fn () => $field->getChildComponents(), []);
            $descriptor['schema'] = array_map(
                fn ($child) => self::fieldToDescriptor($child),
                $childComponents
            );
        }

        return $descriptor;
    }

    /**
     * Safely call a closure that may access uninitialized Filament container properties.
     */
    protected static function safeCall(callable $fn, mixed $fallback = null): mixed
    {
        try {
            return $fn();
        } catch (\Error|\Exception) {
            return $fallback;
        }
    }

    protected static function textInputType(TextInput $field): string
    {
        // Check if numeric
        if ($field->isNumeric()) {
            return 'number';
        }

        return 'text';
    }
}
