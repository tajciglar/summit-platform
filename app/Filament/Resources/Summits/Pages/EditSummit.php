<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSummit extends EditRecord
{
    protected static string $resource = SummitResource::class;

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()];
    }
}
