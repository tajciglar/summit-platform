<?php

namespace App\Filament\Resources\DailyReports\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;

class DailyReportsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->groups([
                Group::make('summit.title')->label('Summit'),
            ])
            ->defaultGroup('summit.title')
            ->defaultSort('report_date', 'desc')
            ->columns([
                TextColumn::make('summit.title')
                    ->label('Summit')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('report_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('views')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('optins')
                    ->label('Opt-ins')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('optin_rate')
                    ->label('Optin %')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state * 100, 2).'%' : '—')
                    ->sortable(),
                TextColumn::make('nr_of_purchases')
                    ->label('Purchases')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('purchase_rate')
                    ->label('Purchase %')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state * 100, 2).'%' : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('revenue_usd_cents')
                    ->label('Revenue $')
                    ->formatStateUsing(fn ($state) => $state !== null ? '$'.number_format($state / 100, 2) : '—')
                    ->sortable(),
                TextColumn::make('revenue_eur_cents')
                    ->label('Revenue €')
                    ->formatStateUsing(fn ($state) => $state !== null ? '€'.number_format($state / 100, 2) : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('ad_spend_eur_cents')
                    ->label('Ad Spend €')
                    ->formatStateUsing(fn ($state) => $state !== null ? '€'.number_format($state / 100, 2) : '—')
                    ->sortable(),
                TextColumn::make('cpl_eur_cents')
                    ->label('CPL €')
                    ->formatStateUsing(fn ($state) => $state !== null ? '€'.number_format($state / 100, 2) : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('cpo_eur_cents')
                    ->label('CPO €')
                    ->formatStateUsing(fn ($state) => $state !== null ? '€'.number_format($state / 100, 2) : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('aov_usd_cents')
                    ->label('AOV $')
                    ->formatStateUsing(fn ($state) => $state !== null ? '$'.number_format($state / 100, 2) : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('roas')
                    ->label('ROAS')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state, 2) : '—')
                    ->sortable(),
                TextColumn::make('checkout_rate')
                    ->label('Checkout %')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state * 100, 2).'%' : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('upsell_take_rate')
                    ->label('Upsell %')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state * 100, 2).'%' : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('comment')
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('summit_id')
                    ->relationship('summit', 'title')
                    ->label('Summit')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
