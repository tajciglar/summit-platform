<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use App\Models\Summit;
use App\Support\CurrentSummit;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\Enums\ContentTabPosition;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Enums\FontWeight;

class ViewSummit extends ViewRecord
{
    protected static string $resource = SummitResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);
        CurrentSummit::set($this->record);
    }

    /**
     * Relation managers render as tabs alongside the main "Basics" tab,
     * giving the summit page a clear in-page section nav: Basics, Funnels,
     * Speakers, Orders. Funnels come first because operators work on them
     * day-to-day; speakers/orders are secondary.
     */
    public function getContentTabPosition(): ?ContentTabPosition
    {
        return ContentTabPosition::After;
    }

    public function getDefaultActiveRelationManagerTab(): ?string
    {
        return 'funnels';
    }

    protected function getHeaderActions(): array
    {
        /** @var Summit $summit */
        $summit = $this->record;
        $hostname = optional($summit?->domain)->hostname;
        // Pick any one active funnel on the summit as the "open live" target.
        // A summit can only have one live funnel at a time anyway (Funnel's
        // saving hook enforces that), so this is deterministic.
        $liveFunnel = $summit?->funnels()->where('is_active', true)->first();
        $isLive = $liveFunnel && $hostname && $summit->status === 'published';
        $liveUrl = $isLive ? 'https://'.$hostname.'/'.$liveFunnel->slug : null;

        return [
            Action::make('open_live')
                ->label('Open live')
                ->icon('heroicon-m-arrow-top-right-on-square')
                ->color('success')
                ->url($liveUrl)
                ->openUrlInNewTab()
                ->visible($isLive),
            EditAction::make()
                ->url(fn (): string => SummitResource::getUrl('edit', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    /**
     * "Basics" — everything the summit identity, status, and schedule need,
     * in one consolidated section per the user's UX preference.
     */
    public function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Basics')
                ->description('Summit identity, lifecycle status, and phase schedule.')
                ->columnSpanFull()
                ->schema([
                    Grid::make(12)
                        ->schema([
                            TextEntry::make('title')
                                ->weight(FontWeight::Bold)
                                ->size('lg')
                                ->columnSpan(6),
                            TextEntry::make('status')
                                ->badge()
                                ->color(fn (string $state): string => match ($state) {
                                    'published' => 'success',
                                    'draft' => 'gray',
                                    'archived' => 'warning',
                                    default => 'gray',
                                })
                                ->columnSpan(3),
                            TextEntry::make('current_phase')
                                ->label('Current phase')
                                ->badge()
                                ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : '—')
                                ->color(fn (?string $state): string => match ($state) {
                                    'during' => 'success',
                                    'late_pre' => 'warning',
                                    'pre' => 'info',
                                    'post' => 'gray',
                                    default => 'gray',
                                })
                                ->columnSpan(3),
                            TextEntry::make('slug')
                                ->prefix('/')
                                ->color('gray')
                                ->copyable()
                                ->columnSpan(6),
                        ]),

                    Grid::make(5)
                        ->schema([
                            TextEntry::make('pre_summit_starts_at')
                                ->label('Pre-summit starts')
                                ->dateTime()
                                ->placeholder('—'),
                            TextEntry::make('late_pre_summit_starts_at')
                                ->label('Late pre-summit')
                                ->dateTime()
                                ->placeholder('—'),
                            TextEntry::make('during_summit_starts_at')
                                ->label('During summit')
                                ->dateTime()
                                ->placeholder('—'),
                            TextEntry::make('post_summit_starts_at')
                                ->label('Post-summit')
                                ->dateTime()
                                ->placeholder('—'),
                            TextEntry::make('ends_at')
                                ->label('Ends')
                                ->dateTime()
                                ->placeholder('—'),
                        ]),

                    Grid::make(12)
                        ->schema([
                            TextEntry::make('domain.name')
                                ->label('Published on')
                                ->badge()
                                ->color('primary')
                                ->placeholder('Not published to any domain')
                                ->columnSpan(6),
                            TextEntry::make('ac_optin_tag')
                                ->label('AC optin tag')
                                ->placeholder('Not configured')
                                ->badge()
                                ->color(fn (?string $state): string => $state ? 'success' : 'gray')
                                ->columnSpan(6),
                        ]),
                ]),
        ]);
    }
}
