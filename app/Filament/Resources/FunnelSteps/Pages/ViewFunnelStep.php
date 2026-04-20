<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStep;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewFunnelStep extends ViewRecord
{
    use ManagesLandingPageDrafts;

    protected static string $resource = FunnelStepResource::class;

    /**
     * Legacy landing-page-generator output (stored as a map) isn't compatible
     * with Filament's Builder component. Coerce before hydration.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['page_content'] = FunnelStepResource::coerceToBuilderState($data['page_content'] ?? []);

        return $data;
    }

    protected function getHeaderActions(): array
    {
        /** @var FunnelStep $step */
        $step = $this->record;

        return [
            EditAction::make()->url(fn () => FunnelStepResource::getUrl('edit', ['record' => $step])),
            DeleteAction::make(),
        ];
    }
}
