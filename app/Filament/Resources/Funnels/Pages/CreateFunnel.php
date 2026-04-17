<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use Filament\Resources\Pages\CreateRecord;

class CreateFunnel extends CreateRecord
{
    protected static string $resource = FunnelResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
