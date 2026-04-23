<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Pages\Concerns\InjectsCurrentSummitOnCreate;
use App\Filament\Resources\Products\ProductResource;
use Filament\Resources\Pages\CreateRecord;

class CreateProduct extends CreateRecord
{
    use InjectsCurrentSummitOnCreate;

    protected static string $resource = ProductResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('edit', ['record' => $this->record]);
    }
}
