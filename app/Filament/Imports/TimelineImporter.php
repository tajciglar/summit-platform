<?php

namespace App\Filament\Imports;

use App\Models\Summit;
use App\Models\SummitCampaignActivity;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Support\Carbon;

class TimelineImporter extends Importer
{
    protected static ?string $model = SummitCampaignActivity::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('summit_name')
                ->label('Summit Name')
                ->requiredMapping()
                ->rules(['required', 'string'])
                ->fillRecordUsing(function (SummitCampaignActivity $record, string $state): void {
                    $summit = Summit::where('title', 'ilike', '%'.trim($state).'%')->first();
                    if ($summit) {
                        $record->summit_id = $summit->id;
                    }
                }),
            ImportColumn::make('activity_type')
                ->label('Activity Type')
                ->requiredMapping()
                ->rules(['required'])
                ->fillRecordUsing(function (SummitCampaignActivity $record, string $state): void {
                    $map = [
                        'promo' => 'promo',
                        'peak promo' => 'peak_promo',
                        'peak_promo' => 'peak_promo',
                        'event' => 'event',
                        'book speakers' => 'book_speakers',
                        'book_speakers' => 'book_speakers',
                        'interviews' => 'interviews',
                        'interviews start' => 'interviews',
                        'testing' => 'testing',
                        'replay' => 'replay',
                    ];
                    $normalized = strtolower(trim($state));
                    $record->activity_type = $map[$normalized] ?? 'custom';
                }),
            ImportColumn::make('label')
                ->rules(['nullable', 'string', 'max:255']),
            ImportColumn::make('starts_at')
                ->label('Start Date')
                ->requiredMapping()
                ->rules(['required'])
                ->fillRecordUsing(function (SummitCampaignActivity $record, string $state): void {
                    $record->starts_at = Carbon::parse(trim($state));
                }),
            ImportColumn::make('ends_at')
                ->label('End Date')
                ->requiredMapping()
                ->rules(['required'])
                ->fillRecordUsing(function (SummitCampaignActivity $record, string $state): void {
                    $record->ends_at = Carbon::parse(trim($state));
                }),
            ImportColumn::make('notes')
                ->rules(['nullable', 'string']),
        ];
    }

    public function resolveRecord(): ?SummitCampaignActivity
    {
        return new SummitCampaignActivity;
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $count = number_format($import->successful_rows);

        return "Timeline import completed: {$count} activities imported.";
    }
}
