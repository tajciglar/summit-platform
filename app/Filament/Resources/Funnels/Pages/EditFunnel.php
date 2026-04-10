<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnel extends EditRecord
{
    protected static string $resource = FunnelResource::class;

    public function hasCombinedRelationManagerTabsWithContent(): bool
    {
        return true;
    }

    public function getContentTabLabel(): ?string
    {
        return 'Details';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('preview')
                ->label('Preview')
                ->icon('heroicon-o-eye')
                ->color('success')
                ->url(function (): ?string {
                    $funnel = $this->getRecord();
                    $funnel->loadMissing('summit', 'steps');
                    $firstStep = $funnel->steps->sortBy('sort_order')->first();
                    if (! $firstStep || ! $funnel->summit) {
                        return null;
                    }

                    return url("/{$funnel->summit->slug}/{$funnel->slug}/{$firstStep->slug}?preview=1");
                })
                ->openUrlInNewTab()
                ->hidden(function (): bool {
                    $funnel = $this->getRecord();
                    $funnel->loadMissing('steps');

                    return $funnel->steps->isEmpty();
                }),
            Action::make('openFlowView')
                ->label('Flow View')
                ->icon('heroicon-o-arrows-right-left')
                ->color('info')
                ->url(fn () => url("/admin/flow/{$this->getRecord()->id}"))
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
