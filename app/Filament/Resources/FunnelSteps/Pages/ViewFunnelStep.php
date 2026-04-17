<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStep;
use App\Models\LandingPageDraft;
use App\Services\Templates\PublishDraftService;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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

        return [
            EditAction::make()->url(fn () => FunnelStepResource::getUrl('edit', ['record' => $step])),
            DeleteAction::make(),
        ];
    }

    /**
     * Publish a draft variant as the step's live landing page.
     * Called from the inline "Publish" button on each draft row.
     */
    public function publishDraft(string $draftId): void
    {
        $draft = LandingPageDraft::findOrFail($draftId);

        try {
            app(PublishDraftService::class)->publish($draft, auth()->user());
            Notification::make()->title('Published')->success()->send();
        } catch (ModelNotFoundException $e) {
            Notification::make()
                ->title('Cannot publish')
                ->body('This funnel has no optin step to publish to.')
                ->danger()
                ->send();
        }
    }

    public function deleteDraft(string $draftId): void
    {
        LandingPageDraft::where('id', $draftId)->delete();
        Notification::make()->title('Draft deleted')->success()->send();
    }
}
