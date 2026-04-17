<?php

namespace App\Filament\Resources\FunnelStepBumps\Pages;

use App\Filament\Resources\FunnelStepBumps\FunnelStepBumpResource;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\Product;
use Filament\Resources\Pages\CreateRecord;

class CreateFunnelStepBump extends CreateRecord
{
    protected static string $resource = FunnelStepBumpResource::class;

    protected string $view = 'filament.resources.funnel-step-bumps.edit';

    public function mount(): void
    {
        parent::mount();

        // Prefill funnel_step_id when coming from a step view link (?funnel_step_id=...).
        if ($stepId = request()->query('funnel_step_id')) {
            $this->form->fill(['funnel_step_id' => $stepId, 'is_active' => true, 'sort_order' => 0]);
        }
    }

    protected function getRedirectUrl(): string
    {
        return FunnelStepResource::getUrl('view', ['record' => $this->record->funnel_step_id]);
    }

    /**
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
            'headline' => $state['headline'] ?? null,
            'description' => $state['description'] ?? null,
            'bullets' => $state['bullets'] ?? [],
            'checkbox_label' => $state['checkbox_label'] ?? null,
            'image_url' => null,
            'product_name' => $productName,
            'price_cents' => $priceCents,
        ];
    }
}
