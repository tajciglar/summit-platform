<?php

namespace App\Filament\Resources\Speakers\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SpeakersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('photo')
                    ->collection('photo')
                    ->circular(),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('title')->searchable(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('funnels_count')
                    ->counts('funnels')
                    ->label('Funnels'),
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
