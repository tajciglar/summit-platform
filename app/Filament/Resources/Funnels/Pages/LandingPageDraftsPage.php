<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\LandingPageDraft;
use App\Services\Templates\TemplateRegistry;
use Filament\Resources\Pages\Page;

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
            ->whereNotIn('status', ['rejected', 'archived'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getRegistryProperty(): TemplateRegistry
    {
        return app(TemplateRegistry::class);
    }

    public function approve(string $draftId): void
    {
        LandingPageDraft::findOrFail($draftId)->update(['status' => 'shortlisted']);
    }

    public function reject(string $draftId): void
    {
        LandingPageDraft::findOrFail($draftId)->update(['status' => 'rejected']);
    }

    public function publish(string $draftId): void
    {
        // Task 23 will introduce PublishDraftService. For now, throw — Task 24 wires it up.
        throw new \RuntimeException('Publish not yet wired — Task 23/24 will connect PublishDraftService.');
    }

    public function getPollingInterval(): ?string
    {
        $hasPending = $this->drafts->whereIn('status', ['queued', 'generating'])->isNotEmpty();

        return $hasPending ? '3s' : null;
    }
}
