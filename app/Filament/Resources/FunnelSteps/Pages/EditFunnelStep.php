<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStep;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFunnelStep extends EditRecord
{
    protected static string $resource = FunnelStepResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('preview')
                ->label('Preview')
                ->icon('heroicon-o-eye')
                ->url(function (): string {
                    /** @var FunnelStep $step */
                    $step = $this->getRecord();
                    $step->loadMissing('funnel.summit');
                    $summit = $step->funnel->summit;

                    return url("/{$summit->slug}/{$step->funnel->slug}/{$step->slug}?preview=1");
                })
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
