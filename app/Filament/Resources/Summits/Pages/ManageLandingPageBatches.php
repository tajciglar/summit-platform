<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\Actions\GenerateLandingPagesAction;
use App\Filament\Resources\Summits\SummitResource;
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

        $optinStep = $batch->funnel?->steps()->where('slug', 'optin')->first();

        abort_if(! $optinStep, 422, 'No optin step found in the target funnel');

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
        $draft = LandingPageDraft::findOrFail($draftId);
        $draft->update(['status' => 'rejected']);

        Notification::make()
            ->title("Version {$draft->version_number} rejected.")
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            GenerateLandingPagesAction::make(),
        ];
    }
}
