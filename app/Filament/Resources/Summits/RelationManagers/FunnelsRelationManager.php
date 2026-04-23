<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class FunnelsRelationManager extends RelationManager
{
    protected static string $relationship = 'funnels';

    protected static ?string $title = 'Funnels';

    protected static ?string $recordTitleAttribute = 'name';

    public function form(Schema $schema): Schema
    {
        // Never used — the New action below routes to the full FunnelResource create page.
        return $schema->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->groups([
                Group::make('is_active')
                    ->label('Status')
                    ->getTitleFromRecordUsing(fn (Funnel $record): string => $record->is_active ? 'Live' : 'Draft')
                    ->getKeyFromRecordUsing(fn (Funnel $record): string => $record->is_active ? '1' : '0')
                    ->orderQueryUsing(fn (Builder $query) => $query->orderByDesc('is_active')),
            ])
            ->defaultGroup('is_active')
            ->columns([
                IconColumn::make('is_active')
                    ->label('')
                    ->icon(fn (Funnel $record): ?string => $record->is_active ? 'heroicon-s-bolt' : null)
                    ->color('success'),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('slug')
                    ->color('gray')
                    ->toggleable(),
                TextColumn::make('target_phase')
                    ->label('Phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : 'all')
                    ->color(fn (?string $state): string => match ($state) {
                        'during' => 'success',
                        'late_pre' => 'warning',
                        'pre' => 'info',
                        'post' => 'gray',
                        default => 'primary',
                    }),
                TextColumn::make('steps_count')
                    ->counts('steps')
                    ->label('Steps')
                    ->alignCenter(),
                TextColumn::make('created_at')
                    ->label('Created')
                    ->date()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('target_phase')->options([
                    'pre' => 'Pre-summit',
                    'late_pre' => 'Late pre-summit',
                    'during' => 'During summit',
                    'post' => 'Post-summit',
                ]),
            ])
            ->headerActions([
                Action::make('new')
                    ->label('New funnel')
                    ->icon('heroicon-o-plus')
                    ->url(fn (): string => FunnelResource::getUrl('create')),
            ])
            ->recordActions([
                Action::make('makeLive')
                    ->label('Make live')
                    ->icon('heroicon-o-bolt')
                    ->color('success')
                    ->visible(fn (Funnel $record): bool => ! $record->is_active)
                    ->requiresConfirmation()
                    ->modalHeading('Make this funnel live?')
                    ->modalDescription('Only one funnel can be live per summit. The currently live funnel will become a draft.')
                    ->modalSubmitActionLabel('Yes, make live')
                    ->action(fn (Funnel $record) => $record->update(['is_active' => true])),
                ViewAction::make()
                    ->url(fn (Funnel $record): string => FunnelResource::getUrl('view', ['record' => $record])),
                DeleteAction::make()
                    ->modalHeading('Delete funnel?')
                    ->modalDescription('This will permanently remove the funnel and its steps. This cannot be undone.'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No funnels yet')
            ->emptyStateDescription('Create a funnel to start routing visitors into this summit.')
            ->emptyStateIcon('heroicon-o-funnel');
    }
}
