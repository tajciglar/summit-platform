<?php

namespace App\Filament\Resources\Contacts;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ContactsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('first_name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('optins_count')
                    ->counts('optins')
                    ->label('Optins')
                    ->sortable(),
                TextColumn::make('ac_contact_id')
                    ->label('AC ID')
                    ->placeholder('—'),
                TextColumn::make('failed_optins_count')
                    ->counts(['optins as failed_optins_count' => fn (Builder $q) => $q->where('ac_sync_status', 'failed')])
                    ->label('Failed syncs')
                    ->badge()
                    ->color(fn (int $state): string => $state > 0 ? 'danger' : 'gray')
                    ->placeholder('0'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('synced_to_ac')
                    ->label('Synced to AC')
                    ->query(fn (Builder $query) => $query->whereNotNull('ac_contact_id')),
            ]);
    }
}
