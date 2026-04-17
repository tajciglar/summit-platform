<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnelStep extends EditRecord
{
    protected static string $resource = FunnelStepResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make()->url(fn () => FunnelStepResource::getUrl('view', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
