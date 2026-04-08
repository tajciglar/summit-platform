<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required()->maxLength(500),
                TextInput::make('slug')->required()->maxLength(255),
                Select::make('summit_id')
                    ->relationship('summit', 'title')
                    ->searchable()
                    ->preload()
                    ->placeholder('Cross-summit product'),
                Select::make('category_id')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),
                Textarea::make('description')->rows(3),
                Select::make('product_type')
                    ->options(['one_time' => 'One-time', 'subscription' => 'Subscription'])
                    ->default('one_time')
                    ->required()
                    ->reactive(),
                Select::make('billing_interval')
                    ->options(['month' => 'Monthly', 'year' => 'Yearly'])
                    ->visible(fn ($get) => $get('product_type') === 'subscription'),
                TextInput::make('billing_interval_count')
                    ->numeric()
                    ->default(1)
                    ->visible(fn ($get) => $get('product_type') === 'subscription'),
                TextInput::make('intro_price_cents')
                    ->label('Intro Price (cents)')
                    ->helperText('Upfront charge before regular billing')
                    ->numeric()
                    ->visible(fn ($get) => $get('product_type') === 'subscription'),
                TextInput::make('intro_period_months')
                    ->label('Intro Period (months)')
                    ->numeric()
                    ->visible(fn ($get) => $get('product_type') === 'subscription'),
                TextInput::make('tier')
                    ->placeholder('basic, vip, etc.'),
                Toggle::make('grants_vip_access')
                    ->label('Grants VIP Access')
                    ->helperText('Buyer gets permanent content access'),
                TextInput::make('stripe_product_id')
                    ->label('Stripe Product ID'),
                Toggle::make('is_active')->default(true),
            ]);
    }
}
