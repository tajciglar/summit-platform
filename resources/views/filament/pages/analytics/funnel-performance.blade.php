@php
    $rows = $this->getRows();
    $totals = $this->getTotals();
    $fmt = fn (int $cents) => '$'.number_format($cents / 100, 2);
    $pct = fn (float $rate) => number_format($rate, 2).'%';
    $rateColor = fn (float $rate) => match (true) {
        $rate >= 5 => 'success',
        $rate >= 2 => 'warning',
        $rate > 0 => 'gray',
        default => 'gray',
    };
@endphp

<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Totals header --}}
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Funnels</div>
                <div class="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{{ $rows->count() }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Page views</div>
                <div class="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{{ number_format($totals['views']) }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Orders · Conv</div>
                <div class="mt-1 text-2xl font-bold text-gray-950 dark:text-white">
                    {{ number_format($totals['orders']) }}
                    <span class="ml-2 text-sm font-medium text-gray-500">{{ $pct($totals['conversion_rate']) }}</span>
                </div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">Total revenue</div>
                <div class="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">{{ $fmt($totals['revenue_cents']) }}</div>
            </x-filament::section>
        </div>

        {{-- Per-funnel table --}}
        <x-filament::section>
            <x-slot name="heading">Per-funnel performance</x-slot>
            @if ($rows->isEmpty())
                <div class="py-8 text-center text-sm text-gray-500">
                    No funnels yet in this summit. Create a funnel to start tracking performance.
                </div>
            @else
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="py-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Funnel</th>
                            <th class="py-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Phase</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Views</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Orders</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Conv</th>
                            <th class="py-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">AOV</th>
                            <th class="py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($rows as $row)
                            @php($f = $row['funnel'])
                            <tr class="border-b border-gray-100 dark:border-white/5 last:border-0">
                                <td class="py-3 pr-4">
                                    <a href="{{ $this->getFunnelUrl($f) }}" class="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                                        {{ $f->name }}
                                    </a>
                                    <div class="font-mono text-xs text-gray-400">/{{ $f->slug }}</div>
                                </td>
                                <td class="py-3 pr-4">
                                    @php($phase = $f->target_phase ? str_replace('_', ' ', $f->target_phase) : 'all phases')
                                    <x-filament::badge
                                        :color="match ($f->target_phase) {
                                            'during' => 'success',
                                            'late_pre' => 'warning',
                                            'pre' => 'info',
                                            'post' => 'gray',
                                            default => 'primary',
                                        }"
                                        size="xs"
                                    >
                                        {{ $phase }}
                                    </x-filament::badge>
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
                                <td class="py-3 pr-4 text-right tabular-nums text-sm text-gray-500">
                                    {{ $row['orders'] > 0 ? $fmt($row['aov_cents']) : '—' }}
                                </td>
                                <td class="py-3 text-right tabular-nums text-sm font-semibold text-gray-950 dark:text-white">
                                    {{ $fmt($row['revenue_cents']) }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </x-filament::section>
    </div>
</x-filament-panels::page>
