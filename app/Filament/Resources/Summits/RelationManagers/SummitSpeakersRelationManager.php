<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class SummitSpeakersRelationManager extends RelationManager
{
    protected static string $relationship = 'summitSpeakers';

    protected static ?string $title = 'Speakers';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        return (string) $ownerRecord->summitSpeakers()->count();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('speaker_id')
                    ->relationship('speaker', 'first_name')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('masterclass_title')->maxLength(500),
                Textarea::make('masterclass_description')->rows(3),
                TextInput::make('free_video_url')->label('Free Video URL')->url(),
                TextInput::make('vip_video_url')->label('VIP Video URL')->url(),
                DatePicker::make('presentation_day'),
                TextInput::make('sort_order')->numeric()->default(0),
                TextInput::make('rating')->numeric()->minValue(1)->maxValue(5),
                TextInput::make('free_access_window_hours')
                    ->label('Free Access Window (hours)')
                    ->numeric()
                    ->default(24),
                Toggle::make('is_featured')->default(false),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                TextColumn::make('speaker.first_name')
                    ->label('Speaker')
                    ->formatStateUsing(fn ($record) => $record->speaker->full_name)
                    ->searchable(),
                TextColumn::make('masterclass_title')->limit(40),
                TextColumn::make('presentation_day')->date(),
                TextColumn::make('rating')->badge(),
                IconColumn::make('is_featured')->boolean(),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
