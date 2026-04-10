<?php

namespace App\Filament\Exports;

use App\Models\SummitDailyReport;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class DailyReportExporter extends Exporter
{
    protected static ?string $model = SummitDailyReport::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('summit.title')->label('Summit'),
            ExportColumn::make('report_date'),
            ExportColumn::make('views'),
            ExportColumn::make('optins'),
            ExportColumn::make('optin_rate'),
            ExportColumn::make('nr_of_purchases')->label('Purchases'),
            ExportColumn::make('purchase_rate'),
            ExportColumn::make('revenue_usd_cents')->label('Revenue USD (cents)'),
            ExportColumn::make('revenue_eur_cents')->label('Revenue EUR (cents)'),
            ExportColumn::make('ad_spend_eur_cents')->label('Ad Spend EUR (cents)'),
            ExportColumn::make('cpc_eur_cents')->label('CPC EUR (cents)'),
            ExportColumn::make('cpl_eur_cents')->label('CPL EUR (cents)'),
            ExportColumn::make('cpo_eur_cents')->label('CPO EUR (cents)'),
            ExportColumn::make('aov_usd_cents')->label('AOV USD (cents)'),
            ExportColumn::make('roas')->label('ROAS'),
            ExportColumn::make('checkout_rate'),
            ExportColumn::make('upgrade_checkout_rate'),
            ExportColumn::make('upsell_take_rate'),
            ExportColumn::make('comment'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Daily reports export completed: ' . number_format($export->successful_rows) . ' rows.';
    }
}
