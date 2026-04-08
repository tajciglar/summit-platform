<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\Funnels\FunnelResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class FunnelsRelationManager extends RelationManager
{
    protected static string $relationship = 'funnels';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        return (string) $ownerRecord->funnels()->count();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required()->maxLength(500),
                TextInput::make('slug')->required()->maxLength(255),
                Select::make('target_phase')
                    ->label('Target Phase')
                    ->options([
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                    ])
                    ->placeholder('All phases'),
                Toggle::make('is_active')->default(true),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('slug'),
                TextColumn::make('target_phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => $state ? str_replace('_', ' ', ucfirst($state)) : 'All'),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('steps_count')->counts('steps')->label('Steps'),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([
                EditAction::make()
                    ->url(fn ($record) => FunnelResource::getUrl('edit', ['record' => $record])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
