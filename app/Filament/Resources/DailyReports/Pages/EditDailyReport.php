<?php

namespace App\Filament\Resources\DailyReports\Pages;

use App\Filament\Resources\DailyReports\DailyReportResource;
use App\Models\SummitDailyReport;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditDailyReport extends EditRecord
{
    protected static string $resource = DailyReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('recalculate')
                ->label('Recalculate from Source')
                ->icon('heroicon-o-arrow-path')
                ->requiresConfirmation()
                ->action(function () {
                    /** @var SummitDailyReport $record */
                    $record = $this->getRecord();
                    $record->recalculateFromSource();
                    $record->save();

                    $this->fillForm();

                    Notification::make()
                        ->title('Metrics recalculated from source data')
                        ->success()
                        ->send();
                }),
            DeleteAction::make(),
        ];
    }
}
