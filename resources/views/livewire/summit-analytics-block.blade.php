@php
    use Illuminate\Support\Number;

    $formatValue = function (string $format, float|int $value) use ($currency) {
        if ($format === 'currency') {
            return $currency.Number::format((float) $value, maxPrecision: 2);
        }
        return Number::format((float) $value);
    };

    $tiles = [
        'visitors' => ['label' => 'Visitors', 'icon' => 'users'],
        'contacts' => ['label' => 'Contacts', 'icon' => 'mail'],
        'orders' => ['label' => 'Orders', 'icon' => 'shopping-cart'],
        'revenue' => ['label' => 'Revenue', 'icon' => 'dollar'],
        'order_bumps_revenue' => ['label' => 'Order Bumps Revenue', 'icon' => 'plus'],
        'one_click_upsells_revenue' => ['label' => 'One Click Upsells', 'icon' => 'arrow-up'],
        'average_order_value' => ['label' => 'Avg Order Value', 'icon' => 'calc'],
        'revenue_per_visit' => ['label' => 'Revenue / Visit', 'icon' => 'chart'],
    ];

    $iconSvgs = [
        'users' => '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>',
        'mail' => '<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>',
        'shopping-cart' => '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>',
        'dollar' => '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4c1.105 0 2.105.448 2.828 1.172"/>',
        'plus' => '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>',
        'arrow-up' => '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"/>',
        'calc' => '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        'chart' => '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>',
    ];
@endphp

<div
    wire:key="summit-analytics-{{ $summit->id }}"
    x-data="summitAnalyticsChart(@js([
        'id' => $summit->id,
        'series' => $series,
        'metric' => $selectedMetric,
        'currency' => $currency,
    ]))"
    x-init="init()"
    @chart-data-updated-{{ $summit->id }}.window="update($event.detail)"
    class="space-y-6"
>
    <div>
        <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Overview</h3>
            <span class="text-xs text-gray-400">Till {{ $windowTo->format('M j, Y') }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            @foreach ($tiles as $key => $tile)
                @php
                    $row = $overview[$key] ?? null;
                    $value = $row['value'] ?? 0;
                    $comparison = $row['comparison'] ?? 0;
                    $delta = $row['delta_pct'] ?? null;
                    $format = $row['format'] ?? 'integer';
                    $isUp = $delta !== null && $delta >= 0;
                    $deltaLabel = $delta === null ? '—' : ($isUp ? '+' : '').number_format($delta, 1).'%';
                @endphp
                <div class="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/40 dark:bg-white/[0.02] p-4">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                                {!! $iconSvgs[$tile['icon']] ?? '' !!}
                            </svg>
                            <span class="text-[10.5px] font-semibold uppercase tracking-wider">{{ $tile['label'] }}</span>
                        </div>
                        @if ($delta !== null)
                            <span @class([
                                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold',
                                'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' => $isUp,
                                'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' => ! $isUp,
                            ])>
                                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    @if ($isUp)
                                        <path d="M5.22 12.78a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10 9.06l-3.72 3.72a.75.75 0 01-1.06 0z"/>
                                    @else
                                        <path d="M14.78 7.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 011.06-1.06L10 10.94l3.72-3.72a.75.75 0 011.06 0z"/>
                                    @endif
                                </svg>
                                {{ $deltaLabel }}
                            </span>
                        @else
                            <span class="text-[10.5px] text-gray-400">—</span>
                        @endif
                    </div>

                    <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                        {{ $formatValue($format, $value) }}
                    </div>
                    <div class="mt-0.5 text-[11px] text-gray-500">
                        {{ $formatValue($format, $comparison) }} <span class="text-gray-400">— Till {{ $windowTo->format('M j') }}</span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <div>
        <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Performance</h3>
        </div>

        <div class="-mx-1 mb-4 flex flex-wrap gap-1 overflow-x-auto px-1">
            @foreach ($tabs as $tab)
                <button
                    type="button"
                    wire:click="setMetric('{{ $tab['key'] }}')"
                    @class([
                        'whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                        'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300' => $selectedMetric === $tab['key'],
                        'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5' => $selectedMetric !== $tab['key'],
                    ])
                >
                    {{ $tab['label'] }}
                </button>
            @endforeach
        </div>

        <div class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 p-4">
            <div class="relative h-64 w-full">
                <canvas x-ref="canvas" id="summit-analytics-chart-{{ $summit->id }}" class="!h-full !w-full"></canvas>
            </div>
        </div>
    </div>

    @once
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js" defer></script>
        <script>
            function summitAnalyticsChart(config) {
                return {
                    chart: null,
                    metric: config.metric,
                    currency: config.currency,
                    series: config.series,
                    init() {
                        const start = () => {
                            if (!window.Chart) { return setTimeout(start, 50); }
                            const ctx = this.$refs.canvas.getContext('2d');
                            this.chart = new window.Chart(ctx, {
                                type: 'line',
                                data: {
                                    labels: this.series.labels,
                                    datasets: [{
                                        label: this.metric,
                                        data: this.series.data,
                                        borderColor: 'rgb(99, 102, 241)',
                                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                        fill: true,
                                        tension: 0.35,
                                        pointRadius: 0,
                                        pointHoverRadius: 4,
                                        borderWidth: 2,
                                    }],
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, color: '#9ca3af' } },
                                        y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(156,163,175,0.15)' } },
                                    },
                                },
                            });
                        };
                        start();
                    },
                    update(detail) {
                        if (!this.chart) return;
                        this.metric = detail.metric;
                        this.chart.data.labels = detail.series.labels;
                        this.chart.data.datasets[0].data = detail.series.data;
                        this.chart.data.datasets[0].label = detail.metric;
                        this.chart.update();
                    },
                };
            }
        </script>
    @endonce
</div>
