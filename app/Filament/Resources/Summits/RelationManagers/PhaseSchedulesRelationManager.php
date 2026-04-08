<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PhaseSchedulesRelationManager extends RelationManager
{
    protected static string $relationship = 'phaseSchedules';

    protected static ?string $title = 'Phase Schedule';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('phase')
                    ->options([
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                    ])
                    ->required(),
                DateTimePicker::make('starts_at')->required(),
                DateTimePicker::make('ends_at'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('phase')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => str_replace('_', ' ', ucfirst($state))),
                TextColumn::make('starts_at')->dateTime()->sortable(),
                TextColumn::make('ends_at')->dateTime(),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
