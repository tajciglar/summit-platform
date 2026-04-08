<?php

namespace App\Filament\Resources\Funnels\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class FunnelsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('summit.title')
                    ->label('Summit')
                    ->searchable(),
                TextColumn::make('name')->searchable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('target_phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => $state ? str_replace('_', ' ', ucfirst($state)) : 'All')
                    ->placeholder('All'),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('steps_count')->counts('steps')->label('Steps'),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
