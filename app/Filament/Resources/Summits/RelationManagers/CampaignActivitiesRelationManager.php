<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class CampaignActivitiesRelationManager extends RelationManager
{
    protected static string $relationship = 'campaignActivities';

    protected static ?string $title = 'Campaign Timeline';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        return (string) $ownerRecord->campaignActivities()->count();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('activity_type')
                    ->options([
                        'promo' => 'Promo',
                        'peak_promo' => 'Peak Promo',
                        'event' => 'Event',
                        'book_speakers' => 'Book Speakers',
                        'interviews' => 'Interviews',
                        'testing' => 'Testing',
                        'replay' => 'Replay',
                        'custom' => 'Custom',
                    ])
                    ->required(),
                TextInput::make('label')
                    ->placeholder('Override label (optional)')
                    ->maxLength(255),
                DatePicker::make('starts_at')->required(),
                DatePicker::make('ends_at')->required(),
                TextInput::make('color')
                    ->placeholder('#3B82F6')
                    ->maxLength(7),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Textarea::make('notes')->rows(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('starts_at')
            ->columns([
                TextColumn::make('activity_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'promo' => 'info',
                        'peak_promo' => 'warning',
                        'event' => 'success',
                        'book_speakers' => 'gray',
                        'interviews' => 'gray',
                        'testing' => 'danger',
                        'replay' => 'info',
                        'custom' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str_replace('_', ' ', ucfirst($state))),
                TextColumn::make('label')->placeholder('—'),
                TextColumn::make('starts_at')->date(),
                TextColumn::make('ends_at')->date(),
                TextColumn::make('notes')->limit(40)->placeholder('—'),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make(), DeleteAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
