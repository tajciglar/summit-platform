<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Resources\Funnels\Pages\GenerateLandingPagesPage;
use App\Filament\Resources\Funnels\Pages\LandingPageDraftsPage;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStep;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewFunnelStep extends ViewRecord
{
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

        return array_values(array_filter([
            // step_type-scoped generator actions go first so they lead the header.
            // Optin steps: AI landing page generator (existing).
            $step->step_type === 'optin'
                ? Action::make('generateLandingPages')
                    ->label('Generate landing pages')
                    ->icon('heroicon-o-sparkles')
                    ->color('primary')
                    ->url(fn () => GenerateLandingPagesPage::getUrl(['record' => $step->funnel_id]))
                : null,

            $step->step_type === 'optin'
                ? Action::make('viewLandingPages')
                    ->label('View landing pages')
                    ->icon('heroicon-o-squares-2x2')
                    ->color('gray')
                    ->url(fn () => LandingPageDraftsPage::getUrl(['record' => $step->funnel_id]))
                : null,

            // Future: sales_page → Generate sales page, checkout → Generate checkout, etc.
            // Slot them in here with the same step_type === '…' guard.

            EditAction::make()->url(fn () => FunnelStepResource::getUrl('edit', ['record' => $step])),
            DeleteAction::make(),
        ]));
    }
}
