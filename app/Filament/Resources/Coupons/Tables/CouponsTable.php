<?php

namespace App\Filament\Resources\Coupons\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CouponsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('code')->searchable()->sortable(),
                TextColumn::make('coupon_type')->badge(),
                TextColumn::make('amount')->numeric(),
                TextColumn::make('times_used')->numeric()->label('Used'),
                TextColumn::make('max_uses')->placeholder('Unlimited'),
                TextColumn::make('summit.title')->label('Summit')->placeholder('Any'),
                TextColumn::make('expires_at')->dateTime(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
