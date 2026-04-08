<?php

namespace App\Filament\Resources\FunnelSteps\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
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
                TextInput::make('title')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Select::make('type')
                    ->options([
                        'optin' => 'Opt-in',
                        'checkout' => 'Checkout',
                        'upsell' => 'Upsell',
                        'thank_you' => 'Thank You',
                    ])
                    ->required(),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active'),
                Toggle::make('is_published'),
                TextInput::make('headline'),
            ]);
    }
}
