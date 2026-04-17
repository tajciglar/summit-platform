<?php

namespace App\Filament\Resources\FunnelStepBumps\Pages;

use App\Filament\Resources\FunnelStepBumps\FunnelStepBumpResource;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\Product;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnelStepBump extends EditRecord
{
    protected static string $resource = FunnelStepBumpResource::class;

    protected string $view = 'filament.resources.funnel-step-bumps.edit';

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        // Return to the funnel step view so the admin keeps context.
        return FunnelStepResource::getUrl('view', ['record' => $this->record->funnel_step_id]);
    }

    /**
     * Shape fed to the preview blade partial — read from live Livewire state
     * so the right pane updates as the admin types.
     *
     * @return array<string, mixed>
     */
    public function getPreviewData(): array
    {
        $state = $this->data ?? [];
        $productName = null;
        $priceCents = null;

        if (! empty($state['product_id'])) {
            $product = Product::find($state['product_id']);
            $productName = $product?->name;
            $priceCents = $product?->priceCentsForPhase('during');
        }

        return [
            'headline' => $state['headline'] ?? $this->record->headline,
            'description' => $state['description'] ?? $this->record->description,
            'bullets' => $state['bullets'] ?? $this->record->bullets ?? [],
            'checkbox_label' => $state['checkbox_label'] ?? $this->record->checkbox_label,
            'image_url' => $this->record->getFirstMediaUrl('image', 'preview') ?: null,
            'product_name' => $productName,
            'price_cents' => $priceCents,
        ];
    }
}
