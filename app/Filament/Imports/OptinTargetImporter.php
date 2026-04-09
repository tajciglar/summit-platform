<?php

namespace App\Filament\Imports;

use App\Models\OptinWeeklyTarget;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Support\Carbon;

class OptinTargetImporter extends Importer
{
    protected static ?string $model = OptinWeeklyTarget::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('week_start_date')
                ->label('Week Start Date')
                ->requiredMapping()
                ->rules(['required'])
                ->fillRecordUsing(function (OptinWeeklyTarget $record, string $state): void {
                    $cleaned = trim($state);
                    try {
                        $date = Carbon::parse($cleaned);
                    } catch (\Exception) {
                        $date = Carbon::createFromFormat('d/m/y', $cleaned);
                    }
                    $record->week_start_date = $date;
                    $record->year = (int) $date->format('o');
                    $record->week_number = (int) $date->format('W');
                }),
            ImportColumn::make('weekly_optins_target')
                ->label('Weekly Target')
                ->requiredMapping()
                ->numeric()
                ->fillRecordUsing(function (OptinWeeklyTarget $record, ?string $state): void {
                    $cleaned = str_replace([',', '.'], '', trim($state ?? '0'));
                    $record->weekly_optins_target = (int) $cleaned;
                }),
            ImportColumn::make('notes')
                ->rules(['nullable', 'string']),
        ];
    }

    public function resolveRecord(): ?OptinWeeklyTarget
    {
        return OptinWeeklyTarget::firstOrNew([
            'year' => $this->data['year'] ?? null,
            'week_number' => $this->data['week_number'] ?? null,
        ]);
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $count = number_format($import->successful_rows);

        return "Optin targets import completed: {$count} weeks imported.";
    }
}
