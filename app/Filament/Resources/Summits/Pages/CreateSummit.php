<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use App\Models\Summit;
use App\Support\CurrentSummit;
use Filament\Resources\Pages\CreateRecord;

class CreateSummit extends CreateRecord
{
    protected static string $resource = SummitResource::class;

    /**
     * After create, point the session's "current summit" filter at the new
     * record. Without this, the next request's SummitResource global scope
     * still narrows `whereKey` to the previously-picked summit, and the
     * redirect target resolves to 404.
     */
    protected function afterCreate(): void
    {
        if ($this->record instanceof Summit) {
            CurrentSummit::set($this->record);
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
