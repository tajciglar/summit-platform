<?php

namespace App\Filament\Resources\DailyReports\Pages;

use App\Filament\Exports\DailyReportExporter;
use App\Filament\Imports\DailyReportImporter;
use App\Filament\Resources\DailyReports\DailyReportResource;
use Filament\Actions\CreateAction;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;
use Filament\Resources\Pages\ListRecords;

class ListDailyReports extends ListRecords
{
    protected static string $resource = DailyReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ExportAction::make()->exporter(DailyReportExporter::class)->label('Export CSV'),
            ImportAction::make()
                ->importer(DailyReportImporter::class)
                ->label('Import CSV'),
            CreateAction::make(),
        ];
    }
}
