<?php

namespace App\Filament\Resources\Speakers\Pages;

use App\Filament\Pages\Concerns\InjectsCurrentSummitOnCreate;
use App\Filament\Resources\Speakers\SpeakerResource;
use Filament\Resources\Pages\CreateRecord;

class CreateSpeaker extends CreateRecord
{
    use InjectsCurrentSummitOnCreate;

    protected static string $resource = SpeakerResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
