<?php

namespace App\Filament\Resources\Summits\Actions;

use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

class GenerateLandingPagesAction
{
    public static function make(): Action
    {
        return Action::make('generateLandingPages')
            ->label('Generate Landing Pages')
            ->icon('heroicon-o-sparkles')
            ->color('primary')
            ->form([
                Select::make('funnel_id')
                    ->label('Target Funnel')
                    ->required()
                    ->options(fn (Summit $record) =>
                        $record->funnels()->pluck('name', 'id')->toArray()
                    )
                    ->helperText('Blocks will be written to the optin step of this funnel when approved.'),

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
            ->action(function (array $data, Summit $record): void {
                $batch = LandingPageBatch::create([
                    'summit_id'     => $record->id,
                    'funnel_id'     => $data['funnel_id'],
                    'version_count' => (int) $data['version_count'],
                    'status'        => 'queued',
                    'notes'         => $data['notes'] ?? null,
                ]);

                dispatch(new GenerateLandingPageBatchJob($batch));
            })
            ->successNotificationTitle('Generation started! Versions will appear as they complete.');
    }
}
