<?php

namespace App\Livewire;

use App\Models\Summit;
use App\Services\Analytics\SummitAnalytics;
use Illuminate\Support\Carbon;
use Livewire\Attributes\Locked;
use Livewire\Component;

class SummitAnalyticsBlock extends Component
{
    #[Locked]
    public string $summitId;

    public string $selectedMetric = 'revenue';

    /** @var array<int, array{key:string,label:string}> */
    public array $tabs = [
        ['key' => 'revenue', 'label' => 'Revenue'],
        ['key' => 'orders', 'label' => 'Orders'],
        ['key' => 'visitors', 'label' => 'Visitors'],
        ['key' => 'contacts', 'label' => 'Contacts'],
        ['key' => 'order_bumps_revenue', 'label' => 'Order Bumps Revenue'],
        ['key' => 'one_click_upsells_revenue', 'label' => 'One Click Upsells Revenue'],
        ['key' => 'average_order_value', 'label' => 'Average Order Value'],
        ['key' => 'revenue_per_visit', 'label' => 'Revenue Per Visit'],
    ];

    public function mount(Summit $summit): void
    {
        $this->summitId = (string) $summit->getKey();
    }

    public function setMetric(string $metric): void
    {
        if (! in_array($metric, array_column($this->tabs, 'key'), true)) {
            return;
        }

        $this->selectedMetric = $metric;
        $series = $this->buildSeries($this->resolveSummit());

        $this->dispatch('chart-data-updated-'.$this->summitId, series: $series, metric: $metric);
    }

    public function render()
    {
        $summit = $this->resolveSummit();
        $analytics = app(SummitAnalytics::class);

        $window = $this->window($summit);
        $overview = $analytics->overview($summit, $window['from'], $window['to']);
        $series = $this->buildSeries($summit);

        return view('livewire.summit-analytics-block', [
            'summit' => $summit,
            'overview' => $overview,
            'series' => $series,
            'tabs' => $this->tabs,
            'selectedMetric' => $this->selectedMetric,
            'currency' => '$',
            'windowTo' => $window['to'],
        ]);
    }

    /**
     * @return array{labels: array<int,string>, data: array<int,float>}
     */
    private function buildSeries(Summit $summit): array
    {
        $window = $this->window($summit);

        return app(SummitAnalytics::class)
            ->dailySeries($summit, $this->selectedMetric, $window['from'], $window['to']);
    }

    /**
     * @return array{from: Carbon, to: Carbon}
     */
    private function window(Summit $summit): array
    {
        $from = $summit->pre_summit_starts_at?->copy() ?? now()->subDays(30);
        $end = $summit->ends_at?->copy() ?? now();
        $to = Carbon::instance(now())->min($end);

        return [
            'from' => $from->startOfDay(),
            'to' => $to->endOfDay(),
        ];
    }

    private function resolveSummit(): Summit
    {
        return Summit::query()->withoutGlobalScopes()->findOrFail($this->summitId);
    }
}
