<?php

namespace App\Filament\Forms\Components;

use App\Filament\Schemas\JsonSchemaFormBuilder;
use App\Services\Blocks\BlockCatalogService;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Fieldset;
use Filament\Schemas\Components\Utilities\Get;

class BlockEditor extends Field
{
    protected string $view = 'filament-forms::components.fieldset';

    public static function make(?string $name = 'content'): Repeater
    {
        $catalogService = app(BlockCatalogService::class);

        $typeOptions = [];
        $schemasByType = [];
        try {
            $catalog = $catalogService->current();
            foreach ($catalog['blocks'] ?? [] as $block) {
                $typeOptions[$block['type']] = "{$block['type']} ({$block['category']})";
                $schemasByType[$block['type']] = $block['schema'];
            }
        } catch (\Throwable $e) {
            // Catalog unavailable — empty options until catalog syncs
        }

        return Repeater::make($name)
            ->label('Blocks')
            ->schema([
                Select::make('type')
                    ->label('Block type')
                    ->options($typeOptions)
                    ->required()
                    ->reactive(),

                ...self::dynamicFieldsFor($schemasByType),
            ])
            ->itemLabel(fn (array $state): ?string => $state['type'] ?? null)
            ->collapsed()
            ->reorderable()
            ->default([]);
    }

    /**
     * One Fieldset per block type, conditionally visible based on selected type.
     */
    private static function dynamicFieldsFor(array $schemasByType): array
    {
        $fields = [];

        foreach ($schemasByType as $type => $schema) {
            $propsFields = JsonSchemaFormBuilder::build($schema);

            $prefixed = array_map(
                fn ($f) => $f->statePath("props.{$f->getName()}"),
                $propsFields
            );

            $fields[] = Fieldset::make("type_{$type}")
                ->label("{$type} settings")
                ->schema($prefixed)
                ->visible(fn (Get $get) => $get('type') === $type);
        }

        return $fields;
    }
}
