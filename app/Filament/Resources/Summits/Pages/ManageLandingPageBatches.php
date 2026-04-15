<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\Actions\GenerateLandingPagesAction;
use App\Filament\Resources\Summits\SummitResource;
use App\Jobs\RegenerateSectionJob;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\DB;

class ManageLandingPageBatches extends Page
{
    protected static string $resource = SummitResource::class;
    protected string $view            = 'filament.resources.summits.pages.manage-landing-page-batches';
    protected static ?string $title   = 'Landing Pages';

    public function getBatches(): \Illuminate\Database\Eloquent\Collection
    {
        return LandingPageBatch::with(['drafts', 'funnel'])
            ->where('summit_id', $this->record->id)
            ->latest()
            ->get();
    }

    public function approveDraft(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch.funnel.steps')->findOrFail($draftId);
        $batch = $draft->batch;

        if ($draft->status !== 'ready' || $batch->status !== 'running') {
            Notification::make()
                ->title('This draft can no longer be approved.')
                ->warning()
                ->send();
            return;
        }

        $optinStep = $batch->funnel?->steps()->where('slug', 'optin')->first();

        if (! $optinStep) {
            Notification::make()
                ->title('No optin step found in the target funnel.')
                ->danger()
                ->send();
            return;
        }

        DB::transaction(function () use ($draft, $batch, $optinStep) {
            $optinStep->update(['content' => $draft->blocks]);
            $draft->update(['status' => 'approved']);
            LandingPageDraft::where('batch_id', $batch->id)
                ->where('id', '!=', $draft->id)
                ->update(['status' => 'rejected']);
            $batch->update(['status' => 'completed', 'completed_at' => now()]);
        });

        Notification::make()
            ->title("Version {$draft->version_number} approved and pushed to production!")
            ->success()
            ->send();
    }

    public function rejectDraft(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);

        if ($draft->status !== 'ready' || $draft->batch->status !== 'running') {
            Notification::make()->title('Draft cannot be rejected.')->warning()->send();
            return;
        }

        $draft->update(['status' => 'rejected']);

        Notification::make()
            ->title("Version {$draft->version_number} rejected.")
            ->send();
    }

    public function regenerateSection(string $draftId, string $sectionId, ?string $note = null): void
    {
        $draft = LandingPageDraft::findOrFail($draftId);

        if (! in_array($draft->status, ['ready', 'approved'])) {
            Notification::make()
                ->title('Section can only be regenerated on a ready or approved draft.')
                ->warning()
                ->send();
            return;
        }

        $sections = $draft->sections ?? [];
        foreach ($sections as &$section) {
            if ($section['id'] === $sectionId) {
                $section['status'] = 'regenerating';
                break;
            }
        }
        unset($section);
        $draft->update(['sections' => $sections]);

        RegenerateSectionJob::dispatch($draftId, $sectionId, $note);

        Notification::make()
            ->title('Regenerating section — refresh in a moment to see the result.')
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            GenerateLandingPagesAction::make(),
        ];
    }
}
