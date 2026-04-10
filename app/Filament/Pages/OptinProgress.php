<?php

namespace App\Filament\Pages;

use App\Filament\Imports\OptinTargetImporter;
use App\Models\OptinWeeklyTarget;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\ImportAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;

class OptinProgress extends Page
{
    protected static \UnitEnum|string|null $navigationGroup = 'Analytics';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBarSquare;

    protected static ?string $navigationLabel = 'Optin Progress';

    protected static ?string $title = 'Optin Progress';

    protected string $view = 'filament.pages.optin-progress';

    #[\Livewire\Attributes\Url]
    public int $year;

    public function mount(): void
    {
        $this->year = (int) date('Y');
    }

    protected function getHeaderActions(): array
    {
        return [
            ImportAction::make()
                ->importer(OptinTargetImporter::class)
                ->label('Import CSV'),
            Action::make('generateYear')
                ->label('Generate Year')
                ->icon('heroicon-o-plus-circle')
                ->form([
                    TextInput::make('year')
                        ->label('Year')
                        ->numeric()
                        ->default(date('Y'))
                        ->required(),
                    TextInput::make('default_target')
                        ->label('Default Weekly Target')
                        ->numeric()
                        ->default(10000)
                        ->required(),
                ])
                ->action(function (array $data) {
                    $year = (int) $data['year'];
                    $target = (int) $data['default_target'];

                    $start = Carbon::create($year, 1, 1)->startOfWeek(Carbon::MONDAY);
                    $created = 0;

                    while ($start->year <= $year) {
                        $weekNum = (int) $start->format('W');
                        $weekYear = (int) $start->format('o'); // ISO year

                        if ($weekYear !== $year) {
                            $start->addWeek();

                            continue;
                        }

                        $exists = OptinWeeklyTarget::where('year', $year)
                            ->where('week_number', $weekNum)
                            ->exists();

                        if (! $exists) {
                            OptinWeeklyTarget::create([
                                'year' => $year,
                                'week_number' => $weekNum,
                                'week_start_date' => $start->copy(),
                                'weekly_optins_target' => $target,
                            ]);
                            $created++;
                        }

                        $start->addWeek();
                    }

                    Notification::make()
                        ->title("Generated {$created} weeks for {$year}")
                        ->success()
                        ->send();
                }),
        ];
    }

    public function getViewData(): array
    {
        $targets = OptinWeeklyTarget::where('year', $this->year)
            ->orderBy('week_number')
            ->get();

        $cumulativeTarget = 0;
        $rows = $targets->map(function (OptinWeeklyTarget $t) use (&$cumulativeTarget) {
            $cumulativeTarget += $t->weekly_optins_target;
            $realOptins = $t->real_optins;
            $goalPct = $t->weekly_goal_percent;

            return [
                'id' => $t->id,
                'week_number' => $t->week_number,
                'week_start' => $t->week_start_date->format('d/m/Y'),
                'weekly_target' => $t->weekly_optins_target,
                'cumulative_target' => $cumulativeTarget,
                'real_optins' => $realOptins,
                'cumulative_real' => $t->cumulative_real,
                'goal_pct' => $goalPct,
            ];
        });

        // Chart data
        $chartLabels = $rows->pluck('week_start')->toArray();
        $chartTargets = $rows->pluck('weekly_target')->toArray();
        $chartReal = $rows->pluck('real_optins')->toArray();
        $chartCumTarget = $rows->pluck('cumulative_target')->toArray();
        $chartCumReal = $rows->pluck('cumulative_real')->toArray();

        return [
            'rows' => $rows,
            'year' => $this->year,
            'chartLabels' => $chartLabels,
            'chartTargets' => $chartTargets,
            'chartReal' => $chartReal,
            'chartCumTarget' => $chartCumTarget,
            'chartCumReal' => $chartCumReal,
        ];
    }
}
