<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required(),
                TextInput::make('slug')->required(),
                TextInput::make('price')
                    ->label('Price (cents)')
                    ->helperText('Enter in cents — e.g. 4700 for $47.00')
                    ->required()
                    ->numeric()
                    ->minValue(1),
                Select::make('type')
                    ->options(['one_time' => 'One-time', 'subscription' => 'Subscription'])
                    ->default('one_time')
                    ->required(),
                TextInput::make('stripe_price_id')
                    ->label('Stripe Price ID')
                    ->helperText('Required for subscriptions'),
                Toggle::make('is_active')->default(true),
            ]);
    }
}
