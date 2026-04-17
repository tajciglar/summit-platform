<?php

namespace App\Filament\Resources\Speakers\Pages;

use App\Filament\Resources\Speakers\SpeakerResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewSpeaker extends ViewRecord
{
    protected static string $resource = SpeakerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()
                ->url(fn (): string => SpeakerResource::getUrl('edit', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }
}
