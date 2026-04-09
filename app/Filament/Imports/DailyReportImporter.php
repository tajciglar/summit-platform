<?php

namespace App\Filament\Imports;

use App\Models\Summit;
use App\Models\SummitDailyReport;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Support\Carbon;

class DailyReportImporter extends Importer
{
    protected static ?string $model = SummitDailyReport::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('summit_name')
                ->label('Summit Name')
                ->requiredMapping()
                ->rules(['required', 'string'])
                ->fillRecordUsing(function (SummitDailyReport $record, string $state): void {
                    // Try to find summit by title match
                    $summit = Summit::where('title', 'ilike', '%'.trim($state).'%')->first();
                    if ($summit) {
                        $record->summit_id = $summit->id;
                    }
                }),
            ImportColumn::make('report_date')
                ->label('Date')
                ->requiredMapping()
                ->rules(['required'])
                ->fillRecordUsing(function (SummitDailyReport $record, string $state): void {
                    // Handle various date formats: d.m.Y, d/m/Y, Y-m-d
                    $cleaned = trim($state);
                    try {
                        $record->report_date = Carbon::parse($cleaned);
                    } catch (\Exception) {
                        // Try European format
                        $record->report_date = Carbon::createFromFormat('d.m.Y', $cleaned);
                    }
                }),
            ImportColumn::make('views')
                ->numeric()
                ->rules(['nullable', 'integer']),
            ImportColumn::make('optins')
                ->label('Opt-ins')
                ->numeric()
                ->rules(['nullable', 'integer']),
            ImportColumn::make('nr_of_purchases')
                ->label('Nr. of Purchases')
                ->numeric()
                ->rules(['nullable', 'integer']),
            ImportColumn::make('revenue_usd_cents')
                ->label('Revenue USD (cents)')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->revenue_usd_cents = self::parseCurrency($state);
                }),
            ImportColumn::make('revenue_eur_cents')
                ->label('Revenue EUR (cents)')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->revenue_eur_cents = self::parseCurrency($state);
                }),
            ImportColumn::make('ad_spend_eur_cents')
                ->label('Ad Spend EUR (cents)')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->ad_spend_eur_cents = self::parseCurrency($state);
                }),
            ImportColumn::make('cpc_eur_cents')
                ->label('CPC EUR (cents)')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->cpc_eur_cents = self::parseCurrency($state);
                }),
            ImportColumn::make('checkout_rate')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->checkout_rate = self::parsePercent($state);
                }),
            ImportColumn::make('upgrade_checkout_rate')
                ->label('Upgrade > Checkout')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->upgrade_checkout_rate = self::parsePercent($state);
                }),
            ImportColumn::make('upsell_take_rate')
                ->numeric()
                ->fillRecordUsing(function (SummitDailyReport $record, ?string $state): void {
                    $record->upsell_take_rate = self::parsePercent($state);
                }),
            ImportColumn::make('comment')
                ->rules(['nullable', 'string']),
            ImportColumn::make('execution_notes')
                ->rules(['nullable', 'string']),
        ];
    }

    public function resolveRecord(): ?SummitDailyReport
    {
        if (empty($this->data['summit_name']) || empty($this->data['report_date'])) {
            return null;
        }

        $record = new SummitDailyReport;

        // Skip rows that are summit totals (no date-like pattern in the name field)
        $summitName = trim($this->data['summit_name'] ?? '');
        if (empty($summitName) || $summitName === 'IN PROGRESS') {
            return null;
        }

        return $record;
    }

    /**
     * Parse currency strings like "$153,068.00", "€134,393.70" to cents.
     */
    protected static function parseCurrency(?string $value): ?int
    {
        if (empty($value)) {
            return null;
        }

        $cleaned = preg_replace('/[^0-9.,\-]/', '', $value);
        // Handle European format (dots as thousand separators, comma as decimal)
        if (preg_match('/^\d{1,3}(\.\d{3})*(,\d{2})?$/', $cleaned)) {
            $cleaned = str_replace('.', '', $cleaned);
            $cleaned = str_replace(',', '.', $cleaned);
        } else {
            $cleaned = str_replace(',', '', $cleaned);
        }

        $float = (float) $cleaned;

        return (int) round($float * 100);
    }

    /**
     * Parse percentage strings like "62.08%" to decimal (0.6208).
     */
    protected static function parsePercent(?string $value): ?float
    {
        if (empty($value) || str_contains($value, '#DIV')) {
            return null;
        }

        $cleaned = str_replace(['%', ','], ['', '.'], trim($value));

        return round((float) $cleaned / 100, 4);
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $count = number_format($import->successful_rows);

        return "Daily report import completed: {$count} rows imported.";
    }
}
