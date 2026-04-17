<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\ViewEntry;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Enums\FontWeight;

class ViewFunnel extends ViewRecord
{
    protected static string $resource = FunnelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('new_step')
                ->label('New step')
                ->icon('heroicon-o-plus')
                ->color('gray')
                ->url(fn () => FunnelStepResource::getUrl('create')),
            EditAction::make()->url(fn () => FunnelResource::getUrl('edit', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    public function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()
                ->columnSpanFull()
                ->columns(12)
                ->schema([
                    TextEntry::make('name')
                        ->hiddenLabel()
                        ->size('lg')
                        ->weight(FontWeight::Bold)
                        ->columnSpan(6),
                    TextEntry::make('is_active')
                        ->label('Status')
                        ->badge()
                        ->formatStateUsing(fn (bool $state) => $state ? 'Live' : 'Paused')
                        ->color(fn (bool $state) => $state ? 'success' : 'gray')
                        ->icon(fn (bool $state) => $state ? 'heroicon-m-bolt' : 'heroicon-m-pause-circle')
                        ->columnSpan(2),
                    TextEntry::make('target_phase')
                        ->label('Phase')
                        ->badge()
                        ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : 'all phases')
                        ->color(fn (?string $state): string => match ($state) {
                            'during' => 'success',
                            'late_pre' => 'warning',
                            'pre' => 'info',
                            'post' => 'gray',
                            default => 'primary',
                        })
                        ->columnSpan(2),
                    TextEntry::make('summit.title')
                        ->label('Summit')
                        ->columnSpan(2),
                    TextEntry::make('slug')
                        ->prefix('/')
                        ->color('gray')
                        ->copyable()
                        ->columnSpan(6),
                    TextEntry::make('description')
                        ->placeholder('No description')
                        ->columnSpan(6),
                ]),

            ViewEntry::make('steps_list')
                ->columnSpanFull()
                ->view('filament.funnels.steps-list'),
        ]);
    }
}
