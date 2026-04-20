<?php

namespace App\Filament\Concerns;

use App\Models\LandingPageDraft;
use App\Services\Templates\PublishDraftService;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\ModelNotFoundException;

trait ManagesLandingPageDrafts
{
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
