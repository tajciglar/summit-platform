<?php

namespace App\Filament\Resources\Coupons\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CouponForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('code')->required()->maxLength(100)->unique(ignoreRecord: true),
                Select::make('coupon_type')
                    ->options(['percentage' => 'Percentage', 'fixed_amount' => 'Fixed Amount'])
                    ->required(),
                TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->helperText('Percentage (e.g. 20 = 20%) or cents (e.g. 1000 = $10 off)'),
                TextInput::make('max_uses')->numeric()->placeholder('Unlimited'),
                Select::make('summit_id')
                    ->relationship('summit', 'title')
                    ->searchable()
                    ->preload()
                    ->placeholder('Any summit'),
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->placeholder('Any product'),
                DateTimePicker::make('starts_at'),
                DateTimePicker::make('expires_at'),
                Toggle::make('is_active')->default(true),
            ]);
    }
}
