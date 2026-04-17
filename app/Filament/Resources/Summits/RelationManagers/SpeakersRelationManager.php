<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\Speakers\SpeakerResource;
use App\Models\Speaker;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class SpeakersRelationManager extends RelationManager
{
    protected static string $relationship = 'speakers';

    protected static ?string $title = 'Speakers';

    protected static ?string $recordTitleAttribute = 'last_name';

    public function form(Schema $schema): Schema
    {
        // Create / Edit always opens the full SpeakerResource page.
        return $schema->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('photo')
                    ->collection('photo')
                    ->conversion('thumb')
                    ->label('')
                    ->circular()
                    ->size(40),
                TextColumn::make('last_name')
                    ->label('Name')
                    ->formatStateUsing(fn (Speaker $record): string => $record->fullName())
                    ->searchable(['first_name', 'last_name'])
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('masterclass_title')
                    ->label('Masterclass')
                    ->limit(48)
                    ->toggleable(),
                TextColumn::make('rating')
                    ->badge()
                    ->placeholder('—')
                    ->color(fn (?int $state): string => match (true) {
                        $state === null => 'gray',
                        $state >= 4 => 'success',
                        $state >= 3 => 'warning',
                        default => 'danger',
                    }),
                IconColumn::make('is_featured')->boolean()->toggleable(),
                TextColumn::make('goes_live_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('sort_order')
                    ->label('Order')
                    ->alignCenter()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_featured'),
            ])
            ->headerActions([
                Action::make('new')
                    ->label('New speaker')
                    ->icon('heroicon-o-plus')
                    ->url(fn () => SpeakerResource::getUrl('create')),
            ])
            ->recordActions([
                Action::make('view')
                    ->icon('heroicon-o-eye')
                    ->url(fn (Speaker $record) => SpeakerResource::getUrl('view', ['record' => $record])),
                Action::make('edit')
                    ->icon('heroicon-o-pencil-square')
                    ->url(fn (Speaker $record) => SpeakerResource::getUrl('edit', ['record' => $record])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->emptyStateHeading('No speakers yet')
            ->emptyStateDescription('Add the first speaker to populate this summit\'s lineup.')
            ->emptyStateIcon('heroicon-o-microphone');
    }
}
