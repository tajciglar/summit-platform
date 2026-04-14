<?php

namespace App\Filament\Resources\FunnelSteps\Schemas;

use App\Filament\Forms\Components\BlockEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
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
                    ->description('Compose the page from catalog blocks. Add, remove, and reorder.')
                    ->schema([
                        BlockEditor::make('content'),
                    ]),
            ]);
    }
}
