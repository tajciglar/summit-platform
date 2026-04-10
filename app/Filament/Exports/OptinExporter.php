<?php

namespace App\Filament\Exports;

use App\Models\Optin;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class OptinExporter extends Exporter
{
    protected static ?string $model = Optin::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('email'),
            ExportColumn::make('first_name'),
            ExportColumn::make('summit.title')->label('Summit'),
            ExportColumn::make('funnel.name')->label('Funnel'),
            ExportColumn::make('source_url'),
            ExportColumn::make('utm_source'),
            ExportColumn::make('utm_medium'),
            ExportColumn::make('utm_campaign'),
            ExportColumn::make('activecampaign_synced')->label('AC Synced'),
            ExportColumn::make('created_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Optins export completed: ' . number_format($export->successful_rows) . ' rows.';
    }
}
