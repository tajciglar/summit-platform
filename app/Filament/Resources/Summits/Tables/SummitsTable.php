<?php

namespace App\Filament\Resources\Summits\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SummitsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'published' => 'success',
                        'archived' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('current_phase')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pre_summit' => 'info',
                        'late_pre_summit' => 'warning',
                        'during_summit' => 'success',
                        'post_summit' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                        default => $state,
                    }),
                TextColumn::make('funnels_count')->counts('funnels')->label('Funnels'),
                TextColumn::make('starts_at')->dateTime()->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
