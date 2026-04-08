<?php

namespace App\Filament\Resources\FunnelSteps\Schemas;

use App\Enums\StepTemplate;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
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
                    ->required()
                    ->reactive(),
                Select::make('template')
                    ->options(fn (Get $get) => StepTemplate::optionsForType($get('step_type')))
                    ->default('default')
                    ->reactive(),
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->placeholder('No product'),
                TextInput::make('sort_order')->numeric()->default(0),
                Toggle::make('is_published')->default(true),

                Section::make('Page Content')
                    ->schema(fn (Get $get) => StepTemplate::filamentFields($get('template')))
                    ->collapsible(),
            ]);
    }
}
