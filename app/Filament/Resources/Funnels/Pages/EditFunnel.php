<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnel extends EditRecord
{
    protected static string $resource = FunnelResource::class;

    /**
     * The funnel View page is the real editor (inline-editing + steps + design).
     * Stale bookmarks to `/funnels/{id}/edit` land here; bounce them to view.
     */
    public function mount(int|string $record): void
    {
        $this->redirect(static::$resource::getUrl('view', ['record' => $record]));
    }

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make()->url(fn () => FunnelResource::getUrl('view', ['record' => $this->record])),
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }

    /**
     * Force the record-title breadcrumb to point at the funnel View page.
     * ViewFunnel extends EditRecord (not ViewRecord) so Filament's default
     * breadcrumb resolver can treat it as "no view page available" and fall
     * back to the edit URL — which creates a self-loop on this page.
     *
     * @return array<string, string>
     */
    public function getBreadcrumbs(): array
    {
        /** @var Funnel $funnel */
        $funnel = $this->record;

        return [
            FunnelResource::getUrl('index') => FunnelResource::getBreadcrumb(),
            FunnelResource::getUrl('view', ['record' => $funnel]) => $funnel->name,
            $this->getBreadcrumb(),
        ];
    }
}
