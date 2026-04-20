<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Summits\SummitResource;
use App\Models\Domain;
use App\Models\Summit;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class SummitsWidget extends TableWidget
{
    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Summits';

    public function table(Table $table): Table
    {
        return $table
            ->query(function (): Builder {
                $query = Summit::query()->withoutGlobalScopes();

                $domain = Filament::getTenant();
                if ($domain instanceof Domain) {
                    $query->whereHas('domains', fn (Builder $q) => $q->whereKey($domain->getKey()));
                }

                return $query->orderBy('title');
            })
            ->columns([
                TextColumn::make('title')
                    ->weight('bold')
                    ->searchable(),
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
                TextColumn::make('ends_at')
                    ->label('Ends')
                    ->date()
                    ->sortable(),
            ])
            ->recordActions([
                Action::make('open')
                    ->label('Open')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->url(fn (Summit $record): string => SummitResource::getUrl('view', ['record' => $record])),
            ])
            ->headerActions([
                Action::make('new')
                    ->label('New summit')
                    ->icon('heroicon-o-plus')
                    ->url(fn (): string => SummitResource::getUrl('create')),
            ])
            ->emptyStateHeading('No summits yet')
            ->emptyStateDescription('Create your first summit to get started.')
            ->emptyStateIcon('heroicon-o-sparkles')
            ->paginated(false);
    }
}
