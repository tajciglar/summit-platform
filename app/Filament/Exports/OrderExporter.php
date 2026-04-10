<?php

namespace App\Filament\Exports;

use App\Models\Order;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class OrderExporter extends Exporter
{
    protected static ?string $model = Order::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('order_number'),
            ExportColumn::make('user.email')->label('Customer Email'),
            ExportColumn::make('user.name')->label('Customer Name'),
            ExportColumn::make('summit.title')->label('Summit'),
            ExportColumn::make('status'),
            ExportColumn::make('total_cents')->label('Total (cents)'),
            ExportColumn::make('currency'),
            ExportColumn::make('discount_cents')->label('Discount (cents)'),
            ExportColumn::make('coupon.code')->label('Coupon'),
            ExportColumn::make('affiliate.code')->label('Affiliate Code'),
            ExportColumn::make('stripe_payment_intent_id')->label('Stripe PI'),
            ExportColumn::make('utm_source'),
            ExportColumn::make('utm_medium'),
            ExportColumn::make('utm_campaign'),
            ExportColumn::make('completed_at'),
            ExportColumn::make('created_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Orders export completed: ' . number_format($export->successful_rows) . ' rows.';
    }
}
