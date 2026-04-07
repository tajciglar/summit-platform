<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFunnelSteps extends ListRecords
{
    protected static string $resource = FunnelStepResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
