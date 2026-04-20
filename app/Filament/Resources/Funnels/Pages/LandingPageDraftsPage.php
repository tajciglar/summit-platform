<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Enums\LandingPageDraftStatus;
use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\LandingPageDraft;
use App\Services\Templates\PublishDraftService;
use App\Services\Templates\TemplateRegistry;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LandingPageDraftsPage extends Page
{
    protected static string $resource = FunnelResource::class;

    protected string $view = 'filament.pages.landing-page-drafts';

    protected static ?string $title = 'Landing Pages';

    public Funnel $funnel;

    public ?string $batch = null;

    public function mount(string $record, ?string $batch = null): void
    {
        $this->funnel = Funnel::findOrFail($record);
        $this->batch = $batch;
    }

    public function getDraftsProperty()
    {
        return LandingPageDraft::query()
            ->whereHas('batch', fn ($q) => $q->where('funnel_id', $this->funnel->id))
            ->when($this->batch, fn ($q) => $q->where('batch_id', $this->batch))
            ->whereNotIn('status', [LandingPageDraftStatus::Archived->value])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getRegistryProperty(): TemplateRegistry
    {
        return app(TemplateRegistry::class);
    }

    public function approve(string $draftId): void
    {
        LandingPageDraft::findOrFail($draftId)->update(['status' => LandingPageDraftStatus::Shortlisted]);
    }

    public function reject(string $draftId): void
    {
        LandingPageDraft::findOrFail($draftId)->update(['status' => LandingPageDraftStatus::Archived]);
    }

    public function publish(string $draftId): void
    {
        $draft = LandingPageDraft::findOrFail($draftId);

        try {
            app(PublishDraftService::class)
                ->publish($draft, auth()->user());
        } catch (ModelNotFoundException $e) {
            Notification::make()
                ->title('Cannot publish')
                ->body('This funnel has no optin step.')
                ->danger()
                ->send();
        }
    }

    public function getPollingInterval(): ?string
    {
        $hasPending = $this->drafts->filter(
            fn (LandingPageDraft $d) => in_array($d->status, [LandingPageDraftStatus::Queued, LandingPageDraftStatus::Generating], true)
        )->isNotEmpty();

        return $hasPending ? '3s' : null;
    }
}
