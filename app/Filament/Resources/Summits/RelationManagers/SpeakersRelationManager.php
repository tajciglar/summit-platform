<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\Speakers\SpeakerResource;
use App\Models\Speaker;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

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
            ->modifyQueryUsing(fn (Builder $query) => $query
                ->reorder()
                ->orderBy('speaker_summit.day_number')
                ->orderBy('speaker_summit.sort_order'))
            ->columns([
                ImageColumn::make('photo')
                    ->state(fn (Speaker $record): ?string => $record->mediaFor('photo')?->thumbUrl())
                    ->label('')
                    ->circular()
                    ->size(40),
                TextColumn::make('last_name')
                    ->label('Name')
                    ->formatStateUsing(fn (Speaker $record): string => $record->fullName())
                    ->searchable(['first_name', 'last_name'])
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('pivot.masterclass_title')
                    ->label('Masterclass')
                    ->limit(48)
                    ->toggleable(),
            ])
            ->groups([
                Group::make('pivot.day_number')
                    ->label('Day')
                    ->getTitleFromRecordUsing(fn (Speaker $record): string => $record->pivot?->day_number
                        ? "Day {$record->pivot->day_number}"
                        : 'Unassigned')
                    ->getKeyFromRecordUsing(fn (Speaker $record): int => $record->pivot?->day_number ?? 0)
                    ->orderQueryUsing(fn (Builder $query, string $direction) => $query->orderBy('speaker_summit.day_number', $direction)),
            ])
            ->defaultGroup('pivot.day_number')
            ->headerActions([
                Action::make('new')
                    ->label('New speaker')
                    ->icon('heroicon-o-plus')
                    ->url(fn () => SpeakerResource::getUrl('create')),
            ])
            ->recordActions([
                Action::make('edit')
                    ->icon('heroicon-o-pencil-square')
                    ->url(fn (Speaker $record) => SpeakerResource::getUrl('edit', ['record' => $record])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            // Reordering is disabled here because drag-to-reorder would update
            // speakers.sort_order (a global column), while the display order
            // comes from the pivot's sort_order. Reorder via the Speaker form's
            // per-summit Repeater instead.
            ->defaultSort('speaker_summit.day_number')
            ->emptyStateHeading('No speakers yet')
            ->emptyStateDescription('Add the first speaker to populate this summit\'s lineup.')
            ->emptyStateIcon('heroicon-o-microphone');
    }
}
