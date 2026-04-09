<?php

namespace App\Filament\Resources\DailyReports\Pages;

use App\Filament\Imports\DailyReportImporter;
use App\Filament\Resources\DailyReports\DailyReportResource;
use Filament\Actions\CreateAction;
use Filament\Actions\ImportAction;
use Filament\Resources\Pages\ListRecords;

class ListDailyReports extends ListRecords
{
    protected static string $resource = DailyReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ImportAction::make()
                ->importer(DailyReportImporter::class)
                ->label('Import CSV'),
            CreateAction::make(),
        ];
    }
}
