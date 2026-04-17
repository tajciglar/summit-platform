<?php

namespace App\Filament\Resources\Affiliates\Pages;

use App\Filament\Resources\Affiliates\AffiliateResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditAffiliate extends EditRecord
{
    protected static string $resource = AffiliateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make()->url(fn () => AffiliateResource::getUrl('view', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
