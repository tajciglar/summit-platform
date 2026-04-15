<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use App\Models\Summit;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Str;

class EditSummit extends EditRecord
{
    protected static string $resource = SummitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('landingPages')
                ->label('Landing Pages')
                ->icon('heroicon-o-sparkles')
                ->color('primary')
                ->url(fn () => SummitResource::getUrl('landing-pages', ['record' => $this->getRecord()])),
            Action::make('preview')
                ->label('Preview')
                ->icon('heroicon-o-eye')
                ->color('success')
                ->url(function (): ?string {
                    $summit = $this->getRecord();
                    $summit->loadMissing('funnels.steps');
                    $funnel = $summit->funnels->first();
                    $step = $funnel?->steps->sortBy('sort_order')->first();
                    if (! $funnel || ! $step) {
                        return null;
                    }

                    return url("/{$summit->slug}/{$funnel->slug}/{$step->slug}?preview=1");
                })
                ->openUrlInNewTab()
                ->hidden(function (): bool {
                    $summit = $this->getRecord();
                    $summit->loadMissing('funnels.steps');

                    return $summit->funnels->flatMap->steps->isEmpty();
                }),
            Action::make('cloneSummit')
                ->label('Clone Summit')
                ->icon('heroicon-o-document-duplicate')
                ->color('gray')
                ->form([
                    TextInput::make('title')
                        ->label('New Summit Title')
                        ->required()
                        ->default(fn () => $this->getRecord()->title . ' (Copy)'),
                    TextInput::make('slug')
                        ->label('New Slug')
                        ->required()
                        ->default(fn () => $this->getRecord()->slug . '-copy'),
                ])
                ->action(function (array $data) {
                    /** @var Summit $source */
                    $source = $this->getRecord();

                    // Clone summit
                    $clone = $source->replicate(['id', 'slug', 'title', 'created_at', 'updated_at']);
                    $clone->title = $data['title'];
                    $clone->slug = $data['slug'];
                    $clone->status = 'draft';
                    $clone->save();

                    // Clone funnels + steps + bumps
                    foreach ($source->funnels as $funnel) {
                        $newFunnel = $funnel->replicate(['id', 'summit_id', 'created_at', 'updated_at']);
                        $newFunnel->summit_id = $clone->id;
                        $newFunnel->slug = $funnel->slug . '-' . Str::random(4);
                        $newFunnel->save();

                        foreach ($funnel->steps as $step) {
                            $newStep = $step->replicate(['id', 'funnel_id', 'created_at', 'updated_at']);
                            $newStep->funnel_id = $newFunnel->id;
                            $newStep->slug = $step->slug . '-' . Str::random(4);
                            $newStep->save();

                            foreach ($step->bumps as $bump) {
                                $newBump = $bump->replicate(['id', 'funnel_step_id']);
                                $newBump->funnel_step_id = $newStep->id;
                                $newBump->save();
                            }
                        }
                    }

                    // Clone campaign activities
                    foreach ($source->campaignActivities as $activity) {
                        $newActivity = $activity->replicate(['id', 'summit_id', 'created_at', 'updated_at']);
                        $newActivity->summit_id = $clone->id;
                        $newActivity->save();
                    }

                    // Clone checklist items
                    foreach ($source->checklistItems as $item) {
                        $newItem = $item->replicate(['id', 'summit_id', 'created_at', 'updated_at', 'completed_at']);
                        $newItem->summit_id = $clone->id;
                        $newItem->status = 'not_started';
                        $newItem->save();
                    }

                    // Clone phase schedules
                    foreach ($source->phaseSchedules as $schedule) {
                        $newSchedule = $schedule->replicate(['id', 'summit_id']);
                        $newSchedule->summit_id = $clone->id;
                        $newSchedule->save();
                    }

                    Notification::make()
                        ->title("Summit cloned: {$clone->title}")
                        ->success()
                        ->send();

                    return redirect(SummitResource::getUrl('edit', ['record' => $clone]));
                }),
            DeleteAction::make(),
        ];
    }
}
