<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
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
            ->modifyQueryUsing(fn (Builder $query) => $query->orderByDesc('is_active')->orderBy('name'))
            ->columns([
                IconColumn::make('is_active')
                    ->label('Live')
                    ->boolean()
                    ->trueIcon('heroicon-o-bolt')
                    ->falseIcon('heroicon-o-pause-circle')
                    ->trueColor('success')
                    ->falseColor('gray'),
                TextColumn::make('name')
                    ->searchable()
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
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_active')->label('Live'),
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
                Action::make('view')
                    ->label('View')
                    ->icon('heroicon-o-eye')
                    ->url(fn (Funnel $record): string => FunnelResource::getUrl('view', ['record' => $record])),
                Action::make('edit')
                    ->label('Edit')
                    ->icon('heroicon-o-pencil-square')
                    ->url(fn (Funnel $record): string => FunnelResource::getUrl('edit', ['record' => $record])),
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
