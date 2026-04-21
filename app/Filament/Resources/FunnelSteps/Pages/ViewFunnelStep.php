<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStep;
use App\Services\Templates\TemplateBlockFactory;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewFunnelStep extends ViewRecord
{
    use ManagesLandingPageDrafts;

    protected static string $resource = FunnelStepResource::class;

    /**
     * page_content on disk is the canonical map; Builder wants a list.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['page_content'] = app(TemplateBlockFactory::class)
            ->mapToBuilderList($data['page_content'] ?? null);

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
