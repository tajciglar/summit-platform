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

    /**
     * Legacy landing-page-generator output (stored as a map) isn't compatible
     * with Filament's Builder component (which expects a sequential list of
     * {type, data} items). Coerce before Builder hydrates so the form loads.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['page_content'] = FunnelStepResource::coerceToBuilderState($data['page_content'] ?? []);

        return $data;
    }
}
