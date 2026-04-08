<?php

namespace App\Filament\Resources\Orders\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_number')->searchable()->sortable(),
                TextColumn::make('user.email')->label('Customer')->searchable(),
                TextColumn::make('summit.title')->label('Summit'),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'completed' => 'success',
                        'refunded' => 'danger',
                        'partially_refunded' => 'danger',
                        'failed' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('total_cents')
                    ->money('usd', divideBy: 100)
                    ->label('Total')
                    ->sortable(),
                TextColumn::make('items_count')->counts('items')->label('Items'),
                TextColumn::make('completed_at')->dateTime()->sortable(),
                TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
