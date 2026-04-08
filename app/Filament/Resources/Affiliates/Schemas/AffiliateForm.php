<?php

namespace App\Filament\Resources\Affiliates\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AffiliateForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('first_name')->required()->maxLength(255),
                TextInput::make('last_name')->required()->maxLength(255),
                TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
                TextInput::make('code')->required()->maxLength(100)->unique(ignoreRecord: true)
                    ->helperText('Used in URLs: ?ref=CODE'),
                TextInput::make('company')->maxLength(255),
                TextInput::make('commission_rate')
                    ->numeric()
                    ->default(0.3000)
                    ->step(0.01)
                    ->helperText('e.g. 0.30 = 30%'),
                TextInput::make('payment_email')
                    ->email()
                    ->helperText('PayPal email for payouts'),
                Toggle::make('is_active')->default(true),
            ]);
    }
}
