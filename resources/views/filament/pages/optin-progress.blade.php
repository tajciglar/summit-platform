<x-filament-panels::page>
    <div class="space-y-6">
        @php
            $totalTarget = collect($rows)->sum('weekly_target');
            $totalReal = collect($rows)->last()['cumulative_real'] ?? 0;
            $overallPct = $totalTarget > 0 ? round(($totalReal / $totalTarget) * 100, 1) : 0;
            $currentWeek = (int) now()->format('W');
            $thisWeekRow = collect($rows)->firstWhere('week_number', $currentWeek);
            $thisWeekReal = $thisWeekRow['real_optins'] ?? 0;
            $thisWeekTarget = $thisWeekRow['weekly_target'] ?? 0;
            $thisWeekPct = $thisWeekTarget > 0 ? round(($thisWeekReal / $thisWeekTarget) * 100, 1) : 0;
            $bestWeek = collect($rows)->sortByDesc('real_optins')->first();
            $avgWeekly = count($rows) > 0 ? round(collect($rows)->avg('real_optins')) : 0;
        @endphp

        {{-- Year selector + stats in one bar --}}
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-sm">
            <div class="flex items-center gap-3">
                <label class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Year</label>
                <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    @for ($y = date('Y') - 1; $y <= date('Y') + 2; $y++)
                        <button
                            wire:click="$set('year', {{ $y }})"
                            class="px-3 py-1.5 text-sm font-medium transition-colors {{ $year == $y ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                        >{{ $y }}</button>
                    @endfor
                </div>
            </div>
            <div class="flex items-center gap-6 text-xs">
                <div class="text-center">
                    <div class="text-gray-400 dark:text-gray-500">Weeks</div>
                    <div class="text-lg font-bold text-gray-900 dark:text-white">{{ count($rows) }}</div>
                </div>
                <div class="text-center">
                    <div class="text-gray-400 dark:text-gray-500">Avg/Week</div>
                    <div class="text-lg font-bold text-gray-900 dark:text-white">{{ number_format($avgWeekly) }}</div>
                </div>
            </div>
        </div>

        {{-- KPI Cards --}}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {{-- Total Target --}}
            <div class="rounded-xl bg-white dark:bg-gray-900 p-4 border dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Target</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($totalTarget) }}</div>
                <div class="text-[11px] text-gray-400 mt-0.5">{{ $year }} total</div>
            </div>

            {{-- Total Real --}}
            <div class="rounded-xl bg-white dark:bg-gray-900 p-4 border dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Actual</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($totalReal) }}</div>
                <div class="text-[11px] text-gray-400 mt-0.5">cumulative</div>
            </div>

            {{-- Overall Progress --}}
            <div class="rounded-xl bg-white dark:bg-gray-900 p-4 border dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full {{ $overallPct >= 100 ? 'bg-emerald-500' : ($overallPct >= 70 ? 'bg-amber-500' : 'bg-red-500') }}"></div>
                    <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Progress</span>
                </div>
                <div class="text-2xl font-bold {{ $overallPct >= 100 ? 'text-emerald-600' : ($overallPct >= 70 ? 'text-amber-600' : 'text-red-600') }}">
                    {{ $overallPct }}%
                </div>
                <div class="mt-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500 {{ $overallPct >= 100 ? 'bg-emerald-500' : ($overallPct >= 70 ? 'bg-amber-500' : 'bg-red-500') }}" style="width: {{ min($overallPct, 100) }}%"></div>
                </div>
            </div>

            {{-- This Week --}}
            <div class="rounded-xl bg-white dark:bg-gray-900 p-4 border dark:border-gray-700 shadow-sm {{ $thisWeekRow ? 'ring-1 ring-primary-200 dark:ring-primary-800' : '' }}">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                    <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">This Week</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($thisWeekReal) }}</div>
                <div class="text-[11px] {{ $thisWeekPct >= 100 ? 'text-emerald-600' : ($thisWeekPct >= 70 ? 'text-amber-600' : 'text-red-600') }} font-medium mt-0.5">
                    {{ $thisWeekPct }}% of {{ number_format($thisWeekTarget) }}
                </div>
            </div>

            {{-- Best Week --}}
            <div class="rounded-xl bg-white dark:bg-gray-900 p-4 border dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full bg-violet-500"></div>
                    <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Best Week</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ $bestWeek ? number_format($bestWeek['real_optins']) : '—' }}</div>
                <div class="text-[11px] text-gray-400 mt-0.5">{{ $bestWeek ? 'W' . $bestWeek['week_number'] : '' }}</div>
            </div>
        </div>

        {{-- Charts (side by side) --}}
        @if (count($chartLabels) > 0)
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div class="rounded-xl bg-white dark:bg-gray-900 p-5 border dark:border-gray-700 shadow-sm">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Weekly: Target vs Actual</h3>
                    <canvas id="weeklyChart" height="140"></canvas>
                </div>
                <div class="rounded-xl bg-white dark:bg-gray-900 p-5 border dark:border-gray-700 shadow-sm">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Cumulative Progress</h3>
                    <canvas id="cumulativeChart" height="140"></canvas>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/chart.js@4" defer></script>
            <script>
                function initOptinCharts() {
                    const labels = @json($chartLabels);
                    const sharedOpts = {
                        responsive: true,
                        interaction: { intersect: false, mode: 'index' },
                        plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 16, font: { size: 11 } } },
                            tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() } },
                        },
                        scales: {
                            y: { beginAtZero: true, ticks: { callback: v => v >= 1000 ? (v/1000).toFixed(0) + 'k' : v, font: { size: 10 } }, grid: { color: 'rgba(156,163,175,0.1)' } },
                            x: { ticks: { maxTicksLimit: 12, font: { size: 9 } }, grid: { display: false } },
                        },
                    };

                    // Weekly chart
                    const wCtx = document.getElementById('weeklyChart');
                    if (wCtx) {
                        if (wCtx._chart) wCtx._chart.destroy();
                        wCtx._chart = new Chart(wCtx, {
                            type: 'bar',
                            data: {
                                labels,
                                datasets: [
                                    { label: 'Target', data: @json($chartTargets), backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#3B82F6', borderWidth: 1.5, borderRadius: 3, barPercentage: 0.6 },
                                    { label: 'Actual', data: @json($chartReal), backgroundColor: 'rgba(16,185,129,0.5)', borderColor: '#10B981', borderWidth: 1.5, borderRadius: 3, barPercentage: 0.6 },
                                ]
                            },
                            options: sharedOpts,
                        });
                    }

                    // Cumulative chart
                    const cCtx = document.getElementById('cumulativeChart');
                    if (cCtx) {
                        if (cCtx._chart) cCtx._chart.destroy();
                        cCtx._chart = new Chart(cCtx, {
                            type: 'line',
                            data: {
                                labels,
                                datasets: [
                                    { label: 'Cumulative Target', data: @json($chartCumTarget), borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2, borderDash: [5, 3] },
                                    { label: 'Cumulative Actual', data: @json($chartCumReal), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2.5 },
                                ]
                            },
                            options: sharedOpts,
                        });
                    }
                }
                document.addEventListener('livewire:navigated', initOptinCharts);
                document.addEventListener('DOMContentLoaded', initOptinCharts);
            </script>
        @endif

        {{-- Data Table --}}
        <div class="rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Weekly Breakdown</h3>
            </div>
            <div class="overflow-x-auto" style="scrollbar-width: thin;">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50/50 dark:bg-gray-800/50">
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Week</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Starts</th>
                            <th class="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Target</th>
                            <th class="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Actual</th>
                            <th class="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">% Goal</th>
                            <th class="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Cum. Target</th>
                            <th class="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Cum. Actual</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-32">Progress</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse ($rows as $row)
                            @php
                                $isNow = $row['week_number'] == $currentWeek;
                                $pct = $row['goal_pct'];
                                $barPct = $pct !== null ? min($pct, 100) : 0;
                                $barColor = $pct !== null ? ($pct >= 100 ? 'bg-emerald-500' : ($pct >= 70 ? 'bg-amber-500' : 'bg-red-500')) : 'bg-gray-300';
                            @endphp
                            <tr class="{{ $isNow ? 'bg-primary-50/60 dark:bg-primary-900/15' : '' }} hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                                <td class="px-4 py-2">
                                    <div class="flex items-center gap-2">
                                        @if ($isNow)
                                            <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                                        @endif
                                        <span class="font-medium text-gray-700 dark:text-gray-300 {{ $isNow ? 'text-primary-700 dark:text-primary-400' : '' }}">W{{ $row['week_number'] }}</span>
                                    </div>
                                </td>
                                <td class="px-4 py-2 text-gray-500 dark:text-gray-400 text-xs">{{ $row['week_start'] }}</td>
                                <td class="px-4 py-2 text-right text-gray-500 dark:text-gray-400 tabular-nums">{{ number_format($row['weekly_target']) }}</td>
                                <td class="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white tabular-nums">{{ number_format($row['real_optins']) }}</td>
                                <td class="px-4 py-2 text-right">
                                    @if ($pct !== null)
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tabular-nums
                                            {{ $pct >= 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : ($pct >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400') }}">
                                            {{ number_format($pct, 1) }}%
                                        </span>
                                    @else
                                        <span class="text-gray-300 dark:text-gray-600">—</span>
                                    @endif
                                </td>
                                <td class="px-4 py-2 text-right text-gray-400 dark:text-gray-500 tabular-nums text-xs">{{ number_format($row['cumulative_target']) }}</td>
                                <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400 tabular-nums text-xs">{{ number_format($row['cumulative_real']) }}</td>
                                <td class="px-4 py-2">
                                    <div class="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <div class="h-full rounded-full {{ $barColor }} transition-all duration-300" style="width: {{ $barPct }}%"></div>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="px-4 py-16 text-center">
                                    <div class="flex flex-col items-center gap-2">
                                        <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No targets set for {{ $year }}</p>
                                        <p class="text-xs text-gray-400 dark:text-gray-500">Click "Generate Year" to create weekly targets</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
