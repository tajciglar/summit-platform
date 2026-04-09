<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\DailyReports\DailyReportResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class DailyReportsRelationManager extends RelationManager
{
    protected static string $relationship = 'dailyReports';

    protected static ?string $title = 'Daily Reports';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        return (string) $ownerRecord->dailyReports()->count();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                DatePicker::make('report_date')->required(),
                TextInput::make('views')->numeric(),
                TextInput::make('optins')->numeric(),
                TextInput::make('nr_of_purchases')->label('Purchases')->numeric(),
                TextInput::make('revenue_usd_cents')->label('Revenue USD (cents)')->numeric(),
                TextInput::make('revenue_eur_cents')->label('Revenue EUR (cents)')->numeric(),
                TextInput::make('ad_spend_eur_cents')->label('Ad Spend EUR (cents)')->numeric(),
                TextInput::make('cpc_eur_cents')->label('CPC EUR (cents)')->numeric(),
                TextInput::make('checkout_rate')->label('Checkout Rate')->numeric()->step(0.0001),
                TextInput::make('upgrade_checkout_rate')->label('Upgrade > Checkout Rate')->numeric()->step(0.0001),
                TextInput::make('upsell_take_rate')->label('Upsell Take Rate')->numeric()->step(0.0001),
                Textarea::make('comment')->rows(2),
                Textarea::make('execution_notes')->rows(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->defaultSort('report_date', 'desc')
            ->columns([
                TextColumn::make('report_date')->date()->sortable(),
                TextColumn::make('views')->numeric(),
                TextColumn::make('optins')->numeric(),
                TextColumn::make('optin_rate')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state * 100, 2).'%' : '—'),
                TextColumn::make('nr_of_purchases')->label('Purchases')->numeric(),
                TextColumn::make('revenue_usd_cents')
                    ->label('Revenue $')
                    ->formatStateUsing(fn ($state) => $state !== null ? '$'.number_format($state / 100, 2) : '—'),
                TextColumn::make('ad_spend_eur_cents')
                    ->label('Ad Spend €')
                    ->formatStateUsing(fn ($state) => $state !== null ? '€'.number_format($state / 100, 2) : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('roas')
                    ->formatStateUsing(fn ($state) => $state !== null ? number_format($state, 2) : '—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('comment')->limit(30)->placeholder('—')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([
                EditAction::make()
                    ->url(fn ($record) => DailyReportResource::getUrl('edit', ['record' => $record])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
