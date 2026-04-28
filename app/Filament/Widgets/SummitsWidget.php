<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Summits\SummitResource;
use App\Models\Domain;
use App\Models\Summit;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class SummitsWidget extends TableWidget
{
    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Live summits';

    public function table(Table $table): Table
    {
        return $table
            ->query(function (): Builder {
                $query = Summit::query()->withoutGlobalScopes();

                $domain = Filament::getTenant();
                if ($domain instanceof Domain) {
                    $query->where('domain_id', $domain->getKey());
                }

                // Live = event hasn't ended yet (or end date unknown).
                return $query
                    ->where(function ($q): void {
                        $q->whereNull('ends_at')
                            ->orWhere('ends_at', '>=', now());
                    })
                    ->orderBy('title');
            })
            ->columns([
                TextColumn::make('title')
                    ->weight('bold')
                    ->searchable()
                    ->url(fn (Summit $record): string => SummitResource::getUrl('view', ['record' => $record])),
                TextColumn::make('pre_summit_starts_at')
                    ->label('Start')
                    ->date()
                    ->sortable(),
                TextColumn::make('ends_at')
                    ->label('End')
                    ->date()
                    ->sortable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'published' => 'success',
                        'draft' => 'gray',
                        'archived' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('current_phase')
                    ->label('Phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : '—')
                    ->color(fn (?string $state): string => match ($state) {
                        'during' => 'success',
                        'late_pre' => 'warning',
                        'pre' => 'info',
                        'post' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('funnels_count')
                    ->counts('funnels')
                    ->label('Funnels')
                    ->alignCenter(),
                TextColumn::make('speakers_count')
                    ->counts('speakers')
                    ->label('Speakers')
                    ->alignCenter(),
            ])
            ->recordActions([
                Action::make('view')
                    ->label('View')
                    ->icon('heroicon-o-eye')
                    ->url(fn (Summit $record): string => SummitResource::getUrl('view', ['record' => $record])),
                EditAction::make()
                    ->url(fn (Summit $record): string => SummitResource::getUrl('edit', ['record' => $record])),
                DeleteAction::make(),
            ])
            ->emptyStateHeading('No live summits')
            ->emptyStateDescription('Past summits live in Manage summits.')
            ->emptyStateIcon('heroicon-o-sparkles')
            ->paginated(false);
    }
}
