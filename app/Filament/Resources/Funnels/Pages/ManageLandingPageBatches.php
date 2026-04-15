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
use Filament\Forms\Components\CheckboxList;
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

    public function publishDraft(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch.funnel.steps')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);
        $batch = $draft->batch;

        if ($draft->status !== 'ready' || $batch->status !== 'running') {
            Notification::make()->title('This draft can no longer be published.')->warning()->send();

            return;
        }

        $sections = $draft->sections ?? [];
        if (empty($sections)) {
            Notification::make()->title('This draft has no sections to publish.')->warning()->send();

            return;
        }

        foreach ($sections as $section) {
            if (($section['status'] ?? null) !== 'ready') {
                Notification::make()
                    ->title('All sections must be in the "ready" state before publishing.')
                    ->warning()
                    ->send();

                return;
            }
        }

        $optinStep = $batch->funnel?->steps()->where('slug', 'optin')->first();

        if (! $optinStep) {
            Notification::make()->title('No optin step found in the target funnel.')->danger()->send();

            return;
        }

        DB::transaction(function () use ($draft, $batch, $optinStep) {
            $optinStep->update(['content' => ['published_draft_id' => (string) $draft->id]]);
            $draft->update(['status' => 'publishing']);
            LandingPageDraft::where('batch_id', $batch->id)
                ->where('id', '!=', $draft->id)
                ->update(['status' => 'rejected']);
            $batch->update(['status' => 'completed', 'completed_at' => now()]);
        });

        PublishLandingPageDraftJob::dispatch((string) $draft->id);

        Notification::make()
            ->title("Version {$draft->version_number} published — rendering in the background!")
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
                if ($note !== null && $note !== '') {
                    $section['regeneration_note'] = $note;
                }
                break;
            }
        }
        unset($section);
        $draft->update(['sections' => $sections]);

        RegenerateSectionJob::dispatch($draftId, $sectionId, $note);

        Notification::make()->title('Regenerating section — refresh in a moment to see the result.')->success()->send();
    }

    public function regenerateAllSections(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);

        if ($draft->status !== 'ready') {
            Notification::make()->title('Only ready drafts can be fully regenerated.')->warning()->send();

            return;
        }

        $sections = $draft->sections ?? [];
        if (empty($sections)) {
            Notification::make()->title('This draft has no sections.')->warning()->send();

            return;
        }

        foreach ($sections as &$section) {
            $section['status'] = 'regenerating';
        }
        unset($section);

        $draft->update(['sections' => $sections]);

        foreach ($sections as $section) {
            RegenerateSectionJob::dispatch((string) $draft->id, (string) $section['id'], null);
        }

        Notification::make()
            ->title('Regenerating all sections — refresh in a moment to see results.')
            ->success()
            ->send();
    }

    public function updateSectionField(string $draftId, string $sectionId, int $fieldIndex, string $value): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);

        $sections = $draft->sections ?? [];
        $updated = false;

        foreach ($sections as &$section) {
            if (($section['id'] ?? null) === $sectionId) {
                if (isset($section['fields'][$fieldIndex])) {
                    $section['fields'][$fieldIndex]['value'] = $value;
                    $updated = true;
                }
                break;
            }
        }
        unset($section);

        if (! $updated) {
            return;
        }

        $draft->update(['sections' => $sections]);

        Notification::make()->title('Saved.')->success()->duration(1500)->send();
    }

    public function deleteSection(string $draftId, string $sectionId): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);

        $sections = $draft->sections ?? [];
        $filtered = array_values(array_filter(
            $sections,
            fn ($s) => ($s['id'] ?? null) !== $sectionId,
        ));

        if (count($filtered) === count($sections)) {
            return; // nothing removed
        }

        $draft->update(['sections' => $filtered]);

        Notification::make()->title('Section removed.')->success()->send();
    }

    public function deleteDraft(string $draftId): void
    {
        $draft = LandingPageDraft::with('batch')->findOrFail($draftId);
        abort_unless($draft->batch->funnel_id === $this->record->id, 403);

        if (in_array($draft->status, ['generating', 'publishing'], true)) {
            Notification::make()
                ->title('Cannot delete a draft while it is generating or publishing.')
                ->warning()
                ->send();

            return;
        }

        $batch = $draft->batch;
        $versionNumber = $draft->version_number;

        DB::transaction(function () use ($draft, $batch) {
            $draft->delete();

            // If this was the last draft in the batch, remove the batch too.
            if ($batch && $batch->drafts()->count() === 0) {
                $batch->delete();
            }
        });

        Notification::make()
            ->title("Version {$versionNumber} deleted.")
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('generateLandingPages')
                ->label('Generate Landing Pages')
                ->icon('heroicon-o-sparkles')
                ->color('primary')
                ->disabled(fn (): bool => config('features.runtime_gemini_gen')
                    && (($this->record->summit->style_brief_status ?? 'absent') !== 'ready'))
                ->tooltip(fn (): ?string => config('features.runtime_gemini_gen')
                    && (($this->record->summit->style_brief_status ?? 'absent') !== 'ready')
                    ? 'Build the summit\'s Style Brief first (Summit edit page → Build Style Brief).'
                    : null)
                ->form(function () {
                    $catalog = app(\App\Services\Blocks\BlockCatalogService::class)->current();
                    $options = collect($catalog['blocks'] ?? [])
                        ->filter(fn ($b) => in_array('optin', $b['validOn'] ?? [], true))
                        ->mapWithKeys(fn ($b) => [
                            $b['type'] => ($b['type'] ?? 'unknown').' — '.substr($b['purpose'] ?? '', 0, 80),
                        ])
                        ->toArray();

                    $default = $this->record->last_section_selection ?: array_keys($options);

                    return [
                        TextInput::make('version_count')
                            ->label('Number of Versions')
                            ->numeric()
                            ->integer()
                            ->minValue(1)
                            ->maxValue(10)
                            ->default(3)
                            ->required(),
                        CheckboxList::make('allowed_types')
                            ->label('Sections to include')
                            ->options($options)
                            ->columns(2)
                            ->default($default)
                            ->bulkToggleable()
                            ->searchable()
                            ->helperText('Uncheck sections you do NOT want Gemini to generate. Remembered for next time.')
                            ->minItems(4)
                            ->required(),
                        TextInput::make('style_override_url')
                            ->label('Style override URL (optional, this batch only)')
                            ->url()
                            ->placeholder('https://alt-reference.com')
                            ->helperText('Falls back to the summit\'s reference screenshot when empty.'),
                        Textarea::make('notes')
                            ->label('Creative Notes (optional)')
                            ->rows(3)
                            ->placeholder('E.g. "Focus on urgency, mention the free gifts"'),
                    ];
                })
                ->action(function (array $data): void {
                    $this->record->update([
                        'last_section_selection' => $data['allowed_types'] ?? null,
                    ]);
                    $batch = LandingPageBatch::create([
                        'summit_id' => $this->record->summit_id,
                        'funnel_id' => $this->record->id,
                        'version_count' => (int) $data['version_count'],
                        'status' => 'queued',
                        'notes' => $data['notes'] ?? null,
                        'allowed_types' => $data['allowed_types'] ?? null,
                        'style_override_url' => $data['style_override_url'] ?? null,
                    ]);
                    dispatch(new GenerateLandingPageBatchJob($batch));
                })
                ->successNotificationTitle('Generation started! Versions will appear as they complete.'),
        ];
    }
}
