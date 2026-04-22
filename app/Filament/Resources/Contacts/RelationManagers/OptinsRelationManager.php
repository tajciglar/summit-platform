<?php

namespace App\Filament\Resources\Contacts\RelationManagers;

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Optin;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class OptinsRelationManager extends RelationManager
{
    protected static string $relationship = 'optins';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->searchable(),
                TextColumn::make('first_name')
                    ->searchable(),
                TextColumn::make('summit.title')
                    ->label('Summit'),
                TextColumn::make('ac_sync_status')
                    ->label('AC Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'synced' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->tooltip(fn (Optin $record): ?string => $record->ac_sync_error),
                TextColumn::make('ac_synced_at')
                    ->label('Synced at')
                    ->since()
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('ac_sync_status')
                    ->label('AC Status')
                    ->options([
                        'pending' => 'Pending',
                        'synced' => 'Synced',
                        'failed' => 'Failed',
                    ]),
            ])
            ->recordActions([
                Action::make('retry_ac_sync')
                    ->label('Retry AC Sync')
                    ->icon(Heroicon::OutlinedArrowPath)
                    ->color('warning')
                    ->visible(fn (Optin $record): bool => $record->ac_sync_status === 'failed')
                    ->requiresConfirmation()
                    ->action(function (Optin $record): void {
                        $record->update([
                            'ac_sync_status' => 'pending',
                            'ac_sync_error' => null,
                        ]);
                        SyncOptinToActiveCampaign::dispatch($record);
                    }),
            ])
            ->toolbarActions([
                BulkAction::make('retry_failed_syncs')
                    ->label('Retry Failed Syncs')
                    ->icon(Heroicon::OutlinedArrowPath)
                    ->color('warning')
                    ->requiresConfirmation()
                    ->deselectRecordsAfterCompletion()
                    ->action(function (Collection $records): void {
                        $failed = $records->where('ac_sync_status', 'failed');
                        foreach ($failed as $optin) {
                            $optin->update([
                                'ac_sync_status' => 'pending',
                                'ac_sync_error' => null,
                            ]);
                            SyncOptinToActiveCampaign::dispatch($optin);
                        }
                    }),
            ]);
    }
}
