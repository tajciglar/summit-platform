<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('summit.title')->label('Summit')->sortable(),
                TextColumn::make('product_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'one_time' => 'info',
                        'subscription' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('tier')->badge(),
                IconColumn::make('grants_vip_access')->boolean()->label('VIP'),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('prices_count')->counts('prices')->label('Prices'),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
