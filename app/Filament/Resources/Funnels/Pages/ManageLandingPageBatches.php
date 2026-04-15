<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Jobs\PublishLandingPageDraftJob;
use App\Jobs\RegenerateSectionJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ManageLandingPageBatches extends Page
{
    protected static string $resource = FunnelResource::class;

    protected string $view = 'filament.resources.funnels.pages.manage-landing-page-batches';

    protected static ?string $title = 'Landing Pages';

    public Funnel $record;

    public function getBatches(): Collection
    {
        return LandingPageBatch::with(['drafts'])
            ->where('funnel_id', $this->record->id)
            ->latest()
            ->get();
    }

    public function approveDraft(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch.funnel.steps')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);
        $batch = $draft->batch;

        if ($draft->status !== 'ready' || $batch->status !== 'running') {
            Notification::make()->title('This draft can no longer be approved.')->warning()->send();

            return;
        }

        $optinStep = $batch->funnel?->steps()->where('slug', 'optin')->first();

        if (! $optinStep) {
            Notification::make()->title('No optin step found in the target funnel.')->danger()->send();

            return;
        }

        $useNewPath = config('features.runtime_gemini_gen') && ! empty($draft->sections);

        DB::transaction(function () use ($draft, $batch, $optinStep, $useNewPath) {
            if ($useNewPath) {
                $optinStep->update(['content' => ['published_draft_id' => (string) $draft->id]]);
                $draft->update(['status' => 'publishing']);
            } else {
                $optinStep->update(['content' => $draft->blocks]);
                $draft->update(['status' => 'approved']);
            }
            LandingPageDraft::where('batch_id', $batch->id)
                ->where('id', '!=', $draft->id)
                ->update(['status' => 'rejected']);
            $batch->update(['status' => 'completed', 'completed_at' => now()]);
        });

        if ($useNewPath) {
            PublishLandingPageDraftJob::dispatch((string) $draft->id);
        }

        Notification::make()
            ->title($useNewPath
                ? "Version {$draft->version_number} approved — publishing to Next.js in the background!"
                : "Version {$draft->version_number} approved and pushed to production!")
            ->success()
            ->send();
    }

    public function rejectDraft(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);

        if ($draft->status !== 'ready' || $draft->batch->status !== 'running') {
            Notification::make()->title('Draft cannot be rejected.')->warning()->send();

            return;
        }

        $draft->update(['status' => 'rejected']);
        Notification::make()->title("Version {$draft->version_number} rejected.")->send();
    }

    public function regenerateSection(string $draftId, string $sectionId, ?string $note = null): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);

        if (! Str::isUuid($sectionId)) {
            return;
        }

        if ($draft->status !== 'ready') {
            Notification::make()->title('Only ready drafts can have sections regenerated.')->warning()->send();

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

        Notification::make()->title('Regenerating section — refresh in a moment to see the result.')->success()->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('generateLandingPages')
                ->label('Generate Landing Pages')
                ->icon('heroicon-o-sparkles')
                ->color('primary')
                ->form([
                    TextInput::make('version_count')
                        ->label('Number of Versions')
                        ->numeric()
                        ->integer()
                        ->minValue(1)
                        ->maxValue(10)
                        ->default(3)
                        ->required(),
                    Textarea::make('notes')
                        ->label('Creative Notes (optional)')
                        ->rows(3)
                        ->placeholder('E.g. "Focus on urgency, mention the free gifts"'),
                ])
                ->action(function (array $data): void {
                    $batch = LandingPageBatch::create([
                        'summit_id' => $this->record->summit_id,
                        'funnel_id' => $this->record->id,
                        'version_count' => (int) $data['version_count'],
                        'status' => 'queued',
                        'notes' => $data['notes'] ?? null,
                    ]);
                    dispatch(new GenerateLandingPageBatchJob($batch));
                })
                ->successNotificationTitle('Generation started! Versions will appear as they complete.'),
        ];
    }
}
