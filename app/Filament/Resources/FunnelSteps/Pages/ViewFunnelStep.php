<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewFunnelStep extends ViewRecord
{
    protected static string $resource = FunnelStepResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()->url(fn () => FunnelStepResource::getUrl('edit', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }
}
