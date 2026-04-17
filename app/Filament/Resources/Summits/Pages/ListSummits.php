<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSummits extends ListRecords
{
    protected static string $resource = SummitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->url(fn (): string => SummitResource::getUrl('create')),
        ];
    }
}
