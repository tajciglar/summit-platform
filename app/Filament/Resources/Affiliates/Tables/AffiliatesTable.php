<?php

namespace App\Filament\Resources\Affiliates\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AffiliatesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('first_name')->searchable()->sortable(),
                TextColumn::make('last_name')->searchable()->sortable(),
                TextColumn::make('email')->searchable(),
                TextColumn::make('code')->searchable()->badge(),
                TextColumn::make('commission_rate')
                    ->formatStateUsing(fn ($state) => ($state * 100).'%'),
                TextColumn::make('referrals_count')->counts('referrals')->label('Clicks'),
                TextColumn::make('commissions_count')->counts('commissions')->label('Sales'),
                IconColumn::make('is_active')->boolean(),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
