<?php

namespace App\Filament\Resources\FunnelSteps\Schemas;

use App\Enums\BlockType;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class FunnelStepForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('funnel_id')
                    ->relationship('funnel', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('name')->required()->maxLength(500),
                TextInput::make('slug')->required()->maxLength(255),
                Select::make('step_type')
                    ->options([
                        'optin' => 'Opt-in',
                        'sales_page' => 'Sales Page',
                        'checkout' => 'Checkout',
                        'upsell' => 'Upsell',
                        'downsell' => 'Downsell',
                        'thank_you' => 'Thank You',
                    ])
                    ->required(),
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->placeholder('No product'),
                TextInput::make('sort_order')->numeric()->default(0),
                Toggle::make('is_published')->default(true),

                Section::make('Page Blocks')
                    ->description('Add, remove, and reorder blocks to compose your page')
                    ->schema([
                        Repeater::make('content.blocks')
                            ->label('')
                            ->schema([
                                Select::make('type')
                                    ->options(BlockType::options())
                                    ->required()
                                    ->reactive()
                                    ->columnSpanFull(),
                                ...self::blockDataFields(),
                            ])
                            ->itemLabel(fn (array $state): ?string => isset($state['type']) ? BlockType::tryFrom($state['type'])?->label() : 'New Block')
                            ->addActionLabel('Add Block')
                            ->reorderable()
                            ->collapsible()
                            ->cloneable()
                            ->defaultItems(0),
                    ]),
            ]);
    }

    /**
     * Generate all possible block fields, each conditionally visible
     * based on the selected block type.
     */
    private static function blockDataFields(): array
    {
        $allFields = [];

        foreach (BlockType::cases() as $blockType) {
            foreach ($blockType->filamentFields() as $field) {
                $fieldName = $field->getName();

                // Prefix with data. to nest under the block's data key
                $field = $field->statePath("data.{$fieldName}");

                // Only show this field when its block type is selected
                $field = $field->visible(fn (Get $get): bool => $get('type') === $blockType->value);

                $allFields[$blockType->value.'.'.$fieldName] = $field;
            }
        }

        return array_values($allFields);
    }
}
