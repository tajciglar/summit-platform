<?php

namespace App\Filament\Resources\Speakers\Pages;

use App\Filament\Resources\Speakers\SpeakerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSpeakers extends ListRecords
{
    protected static string $resource = SpeakerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->url(fn (): string => SpeakerResource::getUrl('create')),
        ];
    }

    /**
     * The per-summit tab strip was removed in the 2026-04-28 admin refactor
     * (Area 4.1). The list is now filtered via the Summit multi-select
     * SelectFilter on the table, so no tabs are rendered here.
     */
    public function getTabs(): array
    {
        return [];
    }
}
