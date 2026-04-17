<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use Filament\Resources\Pages\CreateRecord;

class CreateSummit extends CreateRecord
{
    protected static string $resource = SummitResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
