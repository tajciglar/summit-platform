<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Year selector --}}
        <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
            <select wire:model.live="year" class="rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                @for ($y = date('Y') - 2; $y <= date('Y') + 2; $y++)
                    <option value="{{ $y }}">{{ $y }}</option>
                @endfor
            </select>
        </div>

        {{-- Summary Stats --}}
        @php
            $totalTarget = collect($rows)->sum('weekly_target');
            $totalReal = collect($rows)->last()['cumulative_real'] ?? 0;
            $overallPct = $totalTarget > 0 ? round(($totalReal / $totalTarget) * 100, 1) : 0;
            $currentWeek = (int) now()->format('W');
        @endphp
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Total Target ({{ $year }})</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($totalTarget) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Total Real Optins</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($totalReal) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
                <div class="text-2xl font-bold {{ $overallPct >= 100 ? 'text-green-600' : ($overallPct >= 70 ? 'text-yellow-600' : 'text-red-600') }}">
                    {{ $overallPct }}%
                </div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Weeks Tracked</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ count($rows) }}</div>
            </div>
        </div>

        {{-- Chart --}}
        @if (count($chartLabels) > 0)
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Weekly Target vs Real Optins</h3>
                <canvas id="optinChart" height="100"></canvas>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
            <script>
                document.addEventListener('livewire:navigated', () => initChart());
                document.addEventListener('DOMContentLoaded', () => initChart());

                function initChart() {
                    const ctx = document.getElementById('optinChart');
                    if (!ctx) return;
                    if (ctx._chart) ctx._chart.destroy();

                    ctx._chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: @json($chartLabels),
                            datasets: [
                                {
                                    label: 'Weekly Target',
                                    data: @json($chartTargets),
                                    borderColor: '#3B82F6',
                                    backgroundColor: 'rgba(59,130,246,0.1)',
                                    fill: false,
                                    tension: 0.3,
                                    pointRadius: 1,
                                },
                                {
                                    label: 'Real Optins',
                                    data: @json($chartReal),
                                    borderColor: '#10B981',
                                    backgroundColor: 'rgba(16,185,129,0.1)',
                                    fill: false,
                                    tension: 0.3,
                                    pointRadius: 2,
                                },
                            ]
                        },
                        options: {
                            responsive: true,
                            interaction: { intersect: false, mode: 'index' },
                            scales: {
                                y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() } }
                            },
                            plugins: {
                                tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() } }
                            }
                        }
                    });
                }
            </script>
        @endif

        {{-- Data Table --}}
        <div class="overflow-x-auto rounded-xl border dark:border-gray-700">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Week</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Week Start</th>
                        <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Weekly Target</th>
                        <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Cumulative Target</th>
                        <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Real Optins</th>
                        <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Cumulative Real</th>
                        <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">% of Goal</th>
                    </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-700">
                    @forelse ($rows as $row)
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 {{ $row['week_number'] == $currentWeek ? 'bg-blue-50 dark:bg-blue-900/20' : '' }}">
                            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">W{{ $row['week_number'] }}</td>
                            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ $row['week_start'] }}</td>
                            <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($row['weekly_target']) }}</td>
                            <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($row['cumulative_target']) }}</td>
                            <td class="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{{ number_format($row['real_optins']) }}</td>
                            <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($row['cumulative_real']) }}</td>
                            <td class="px-3 py-2 text-right font-medium
                                @if ($row['goal_pct'] !== null)
                                    {{ $row['goal_pct'] >= 100 ? 'text-green-600' : ($row['goal_pct'] >= 70 ? 'text-yellow-600' : 'text-red-600') }}
                                @else
                                    text-gray-400
                                @endif">
                                {{ $row['goal_pct'] !== null ? number_format($row['goal_pct'], 1) . '%' : '—' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                No targets set for {{ $year }}. Use "Generate Year" to create weekly targets.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-filament-panels::page>
