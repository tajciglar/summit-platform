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
@endphp

<div class="grid grid-cols-4 gap-4 text-center">
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Optin views</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['optin_views']) }}</div>
    </div>
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Optin submits</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['optin_submits']) }}</div>
        <div class="text-xs text-gray-400">{{ $format($conv['optin_to_submit']) }}</div>
    </div>
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Sales views</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['sales_views']) }}</div>
        <div class="text-xs text-gray-400">{{ $format($conv['submit_to_sales']) }}</div>
    </div>
    <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide">Checkout clicks</div>
        <div class="text-2xl font-semibold">{{ number_format($counts['checkout_clicks']) }}</div>
        <div class="text-xs text-gray-400">{{ $format($conv['sales_to_checkout']) }}</div>
    </div>
</div>

@if (! empty($leaks))
    <div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
        <strong>Leak alert:</strong>
        <ul class="mt-1 list-disc list-inside">
            @foreach ($leaks as $leak)
                <li>{{ $leakLabels[$leak] ?? $leak }} — conversion below target</li>
            @endforeach
        </ul>
    </div>
@endif
