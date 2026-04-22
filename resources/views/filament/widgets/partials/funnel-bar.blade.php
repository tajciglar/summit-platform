@props(['report'])

@php
    $counts = $report['counts'];
    $conv = $report['conversions'];
    $leaks = $report['leaks'];

    $format = fn (?float $rate): string => $rate === null ? '—' : number_format($rate * 100, 1).'%';

    $leakLabels = [
        'optin_to_submit' => 'Optin page → Optin submit',
        'submit_to_sales' => 'Optin submit → Sales page',
        'sales_to_checkout' => 'Sales page → Checkout click',
    ];

    $max = max($counts['optin_views'], 1);
    $widthPct = fn (int $n): float => round(min(100, ($n / $max) * 100), 2);

    $steps = [
        [
            'label' => 'Optin views',
            'count' => $counts['optin_views'],
            'conversion_key' => null,
            'conversion_rate' => null,
            'tone' => 'indigo',
        ],
        [
            'label' => 'Optin submits',
            'count' => $counts['optin_submits'],
            'conversion_key' => 'optin_to_submit',
            'conversion_rate' => $conv['optin_to_submit'],
            'tone' => 'indigo',
        ],
        [
            'label' => 'Sales views',
            'count' => $counts['sales_views'],
            'conversion_key' => 'submit_to_sales',
            'conversion_rate' => $conv['submit_to_sales'],
            'tone' => 'indigo',
        ],
        [
            'label' => 'Checkout clicks',
            'count' => $counts['checkout_clicks'],
            'conversion_key' => 'sales_to_checkout',
            'conversion_rate' => $conv['sales_to_checkout'],
            'tone' => 'indigo',
        ],
    ];
@endphp

<div class="space-y-2">
    @foreach ($steps as $step)
        @php
            $width = $widthPct($step['count']);
            $isLeak = $step['conversion_key'] && in_array($step['conversion_key'], $leaks, true);
            $barClasses = $isLeak
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600';
            $rateClasses = $isLeak
                ? 'text-amber-700 dark:text-amber-400 font-medium'
                : 'text-gray-500 dark:text-gray-400';
        @endphp
        <div class="flex items-center gap-3 sm:gap-4">
            <div class="w-32 sm:w-40 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                {{ $step['label'] }}
            </div>
            <div class="flex-1 relative h-8 rounded-md bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div
                    class="h-full {{ $barClasses }} rounded-md transition-[width] duration-500 ease-out"
                    style="width: {{ $width }}%"
                ></div>
            </div>
            <div class="w-16 sm:w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                {{ number_format($step['count']) }}
            </div>
            <div class="w-20 shrink-0 text-right text-xs tabular-nums {{ $rateClasses }}">
                @if ($step['conversion_key'])
                    <span aria-hidden="true">↓</span> {{ $format($step['conversion_rate']) }}
                @endif
            </div>
        </div>
    @endforeach
</div>

@if (! empty($leaks))
    <div class="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200">
        <svg class="w-5 h-5 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div class="flex-1">
            <div class="font-semibold">Leak alert</div>
            <ul class="mt-1 space-y-0.5">
                @foreach ($leaks as $leak)
                    <li class="text-xs">{{ $leakLabels[$leak] ?? $leak }} — conversion below target</li>
                @endforeach
            </ul>
        </div>
    </div>
@endif
