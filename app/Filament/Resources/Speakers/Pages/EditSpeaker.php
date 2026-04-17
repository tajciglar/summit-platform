<?php

namespace App\Filament\Resources\Speakers\Pages;

use App\Filament\Resources\Speakers\SpeakerResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditSpeaker extends EditRecord
{
    protected static string $resource = SpeakerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make()
                ->url(fn (): string => SpeakerResource::getUrl('view', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
