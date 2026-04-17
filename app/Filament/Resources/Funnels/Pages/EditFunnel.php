<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnel extends EditRecord
{
    protected static string $resource = FunnelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make()->url(fn () => FunnelResource::getUrl('view', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
