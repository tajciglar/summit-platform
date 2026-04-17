<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditSummit extends EditRecord
{
    protected static string $resource = SummitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make()
                ->url(fn (): string => SummitResource::getUrl('view', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
