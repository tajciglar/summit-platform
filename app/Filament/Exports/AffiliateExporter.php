<?php

namespace App\Filament\Exports;

use App\Models\Affiliate;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class AffiliateExporter extends Exporter
{
    protected static ?string $model = Affiliate::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('code'),
            ExportColumn::make('first_name'),
            ExportColumn::make('last_name'),
            ExportColumn::make('email'),
            ExportColumn::make('company'),
            ExportColumn::make('commission_rate'),
            ExportColumn::make('payment_email'),
            ExportColumn::make('is_active'),
            ExportColumn::make('created_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Affiliates export completed: ' . number_format($export->successful_rows) . ' rows.';
    }
}
