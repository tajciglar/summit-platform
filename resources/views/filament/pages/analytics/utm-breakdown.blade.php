@php
    $rows = $this->getRows();
    $fmt = fn (int $cents) => '$'.number_format($cents / 100, 2);
    $pct = fn (float $rate) => number_format($rate, 2).'%';
    $rateColor = fn (float $rate) => match (true) {
        $rate >= 5 => 'success',
        $rate >= 2 => 'warning',
        $rate > 0 => 'gray',
        default => 'gray',
    };
    $totalViews = (int) $rows->sum('views');
    $totalOrders = (int) $rows->sum('orders');
    $totalRevenue = (int) $rows->sum('revenue_cents');
    $overallConversion = $totalViews > 0 ? ($totalOrders / $totalViews) * 100 : 0;
@endphp

<x-filament-panels::page>
    <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">UTM combinations</div>
                <div class="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{{ $rows->count() }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Views</div>
                <div class="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{{ number_format($totalViews) }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Orders · Conv</div>
                <div class="mt-1 text-2xl font-bold text-gray-950 dark:text-white">
                    {{ number_format($totalOrders) }}
                    <span class="ml-2 text-sm font-medium text-gray-500">{{ $pct($overallConversion) }}</span>
                </div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Total revenue</div>
                <div class="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">{{ $fmt($totalRevenue) }}</div>
            </x-filament::section>
        </div>

        <x-filament::section>
            <x-slot name="heading">Revenue by UTM source × campaign</x-slot>
            @if ($rows->isEmpty())
                <div class="py-8 text-center text-sm text-gray-500">
                    No page views or attributed orders yet.
                </div>
            @else
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="py-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Source</th>
                            <th class="py-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Campaign</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Views</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Orders</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Conv</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Revenue</th>
                            <th class="py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($rows as $row)
                            @php($share = $totalRevenue > 0 ? ($row['revenue_cents'] / $totalRevenue) * 100 : 0)
                            <tr class="border-b border-gray-100 dark:border-white/5 last:border-0">
                                <td class="py-3 pr-4">
                                    @if ($row['source'] === '(none)')
                                        <span class="text-sm italic text-gray-400">(none)</span>
                                    @else
                                        <span class="font-medium text-gray-900 dark:text-gray-100">{{ $row['source'] }}</span>
                                    @endif
                                </td>
                                <td class="py-3 pr-4">
                                    @if ($row['campaign'] === '(none)')
                                        <span class="text-sm italic text-gray-400">(none)</span>
                                    @else
                                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ $row['campaign'] }}</span>
                                    @endif
                                </td>
                                <td class="py-3 pr-4 text-right tabular-nums text-sm text-gray-700 dark:text-gray-200">
                                    {{ number_format($row['views']) }}
                                </td>
                                <td class="py-3 pr-4 text-right tabular-nums text-sm text-gray-700 dark:text-gray-200">
                                    {{ number_format($row['orders']) }}
                                </td>
                                <td class="py-3 pr-4 text-right">
                                    @if ($row['views'] > 0)
                                        <x-filament::badge :color="$rateColor($row['conversion_rate'])" size="xs">
                                            {{ $pct($row['conversion_rate']) }}
                                        </x-filament::badge>
                                    @else
                                        <span class="text-xs text-gray-400">—</span>
                                    @endif
                                </td>
                                <td class="py-3 pr-4 text-right tabular-nums text-sm font-semibold text-gray-950 dark:text-white">
                                    {{ $fmt($row['revenue_cents']) }}
                                </td>
                                <td class="py-3 text-right text-sm text-gray-500">
                                    <div class="inline-flex items-center gap-2">
                                        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                            <div class="h-full bg-primary-500" style="width: {{ number_format($share, 1) }}%"></div>
                                        </div>
                                        <span class="tabular-nums">{{ number_format($share, 1) }}%</span>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </x-filament::section>
    </div>
</x-filament-panels::page>
