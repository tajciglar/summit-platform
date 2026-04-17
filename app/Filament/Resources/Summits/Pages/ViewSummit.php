<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewSummit extends ViewRecord
{
    protected static string $resource = SummitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()
                ->url(fn (): string => SummitResource::getUrl('edit', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }
}
