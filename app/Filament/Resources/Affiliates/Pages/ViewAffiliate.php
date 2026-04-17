<?php

namespace App\Filament\Resources\Affiliates\Pages;

use App\Filament\Resources\Affiliates\AffiliateResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAffiliate extends ViewRecord
{
    protected static string $resource = AffiliateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()->url(fn () => AffiliateResource::getUrl('edit', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }
}
