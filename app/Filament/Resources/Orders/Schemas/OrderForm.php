<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('order_number')->required()->unique(ignoreRecord: true),
                Select::make('user_id')
                    ->relationship('user', 'email')
                    ->searchable()
                    ->preload()
                    ->required(),
                Select::make('summit_id')
                    ->relationship('summit', 'title')
                    ->searchable()
                    ->preload(),
                Select::make('funnel_id')
                    ->relationship('funnel', 'name')
                    ->searchable()
                    ->preload(),
                Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'completed' => 'Completed',
                        'refunded' => 'Refunded',
                        'partially_refunded' => 'Partially Refunded',
                        'failed' => 'Failed',
                    ])
                    ->default('pending')
                    ->required(),
                TextInput::make('subtotal_cents')->label('Subtotal (cents)')->numeric()->default(0),
                TextInput::make('discount_cents')->label('Discount (cents)')->numeric()->default(0),
                TextInput::make('total_cents')->label('Total (cents)')->numeric()->default(0),
                TextInput::make('currency')->default('USD')->maxLength(3),

                Section::make('Stripe')
                    ->schema([
                        TextInput::make('stripe_payment_intent_id'),
                        TextInput::make('stripe_checkout_session_id'),
                    ])
                    ->collapsible()
                    ->collapsed(),

                Section::make('UTM Attribution')
                    ->schema([
                        TextInput::make('utm_source'),
                        TextInput::make('utm_medium'),
                        TextInput::make('utm_campaign'),
                        TextInput::make('utm_content'),
                        TextInput::make('utm_term'),
                    ])
                    ->columns(2)
                    ->collapsible()
                    ->collapsed(),
            ]);
    }
}
