<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnel extends EditRecord
{
    protected static string $resource = FunnelResource::class;

    public function hasCombinedRelationManagerTabsWithContent(): bool
    {
        return true;
    }

    public function getContentTabLabel(): ?string
    {
        return 'Details';
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
