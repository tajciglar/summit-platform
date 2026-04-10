<?php

namespace App\Filament\Resources\Summits\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class SummitsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('summit_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'new' => 'success',
                        'replay' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => ucfirst($state)),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'published' => 'success',
                        'archived' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('current_phase')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pre_summit' => 'info',
                        'late_pre_summit' => 'warning',
                        'during_summit' => 'success',
                        'post_summit' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                        default => $state,
                    }),
                TextColumn::make('funnels_count')->counts('funnels')->label('Funnels'),
                TextColumn::make('starts_at')->dateTime()->sortable(),
            ])
            ->recordActions([
                Action::make('quickView')
                    ->label('Quick View')
                    ->icon('heroicon-o-eye')
                    ->color('gray')
                    ->modalHeading(fn ($record) => $record->title)
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close')
                    ->infolist([
                        Section::make('Overview')
                            ->schema([
                                TextEntry::make('status')->badge()->color(fn (string $state) => match ($state) {
                                    'draft' => 'gray', 'published' => 'success', 'archived' => 'warning', default => 'gray',
                                }),
                                TextEntry::make('current_phase')->label('Phase')
                                    ->formatStateUsing(fn (string $state) => str_replace('_', ' ', ucfirst($state))),
                                TextEntry::make('summit_type')->label('Type')->formatStateUsing(fn (string $state) => ucfirst($state)),
                                TextEntry::make('starts_at')->dateTime(),
                                TextEntry::make('ends_at')->dateTime(),
                            ])->columns(3),
                        Section::make('Stats')
                            ->schema([
                                TextEntry::make('optins_count')->label('Optins')
                                    ->state(fn ($record) => number_format($record->optins()->count())),
                                TextEntry::make('orders_count')->label('Orders')
                                    ->state(fn ($record) => number_format($record->orders()->where('status', 'completed')->count())),
                                TextEntry::make('revenue')->label('Revenue')
                                    ->state(fn ($record) => '$' . number_format($record->orders()->where('status', 'completed')->sum('total_cents') / 100, 2)),
                                TextEntry::make('checklist_progress')->label('Checklist')
                                    ->state(function ($record) {
                                        $total = $record->checklistItems()->count();
                                        $done = $record->checklistItems()->where('status', 'done')->count();
                                        return $total > 0 ? "{$done}/{$total} done" : 'No checklist';
                                    }),
                            ])->columns(4),
                    ]),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('bulkUpdateStatus')
                        ->label('Update Status')
                        ->icon('heroicon-o-arrow-path')
                        ->form([
                            Select::make('status')
                                ->options([
                                    'draft' => 'Draft',
                                    'published' => 'Published',
                                    'archived' => 'Archived',
                                ])
                                ->required(),
                        ])
                        ->action(function (Collection $records, array $data) {
                            $records->each(fn ($r) => $r->update(['status' => $data['status']]));
                            Notification::make()
                                ->title(count($records) . ' summits updated to ' . $data['status'])
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('bulkUpdatePhase')
                        ->label('Update Phase')
                        ->icon('heroicon-o-signal')
                        ->form([
                            Select::make('current_phase')
                                ->label('Phase')
                                ->options([
                                    'pre_summit' => 'Pre-Summit',
                                    'late_pre_summit' => 'Late Pre-Summit',
                                    'during_summit' => 'During Summit',
                                    'post_summit' => 'Post-Summit',
                                ])
                                ->required(),
                        ])
                        ->action(function (Collection $records, array $data) {
                            $records->each(fn ($r) => $r->update(['current_phase' => $data['current_phase']]));
                            Notification::make()
                                ->title(count($records) . ' summits phase updated')
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
