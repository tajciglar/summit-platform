@php
    /** @var \App\Models\Funnel $funnel */
    $funnel = $getRecord();

    $stepLabels = [
        'optin' => 'Optin',
        'sales_page' => 'Sales Page',
        'checkout' => 'Checkout',
        'upsell' => 'One Click Upsell',
        'downsell' => 'Downsell',
        'thank_you' => 'Thank you',
    ];

    $steps = $funnel->steps()
        ->orderBy('sort_order')
        ->with(['bumps.product', 'product'])
        ->get();

    // Revenue per step: completed orders × total_cents
    $revenueByStep = \App\Models\Order::query()
        ->where('funnel_id', $funnel->id)
        ->where('status', 'completed')
        ->selectRaw('funnel_step_id, COUNT(*) as orders_count, COALESCE(SUM(total_cents), 0) as cents')
        ->groupBy('funnel_step_id')
        ->get()
        ->keyBy('funnel_step_id');

    $viewUrl = fn ($s) => \App\Filament\Resources\FunnelSteps\FunnelStepResource::getUrl('view', ['record' => $s]);
    $editUrl = fn ($s) => \App\Filament\Resources\FunnelSteps\FunnelStepResource::getUrl('edit', ['record' => $s]);
    $createUrl = \App\Filament\Resources\FunnelSteps\FunnelStepResource::getUrl('create');

    $formatMoney = fn (int $cents) => '$'.number_format($cents / 100, 2);
@endphp

<div class="space-y-6">
    {{-- Section heading --}}
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-950 dark:text-white">Steps</h2>
            <span class="text-sm text-gray-500">{{ $steps->count() }} total</span>
        </div>
        <a
            href="{{ $createUrl }}"
            class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Add New Step
        </a>
    </div>

    {{-- Step cards --}}
    @forelse ($steps as $step)
        @php
            $metrics = $revenueByStep->get($step->id);
            $orderCount = $metrics?->orders_count ?? 0;
            $revenueCents = (int) ($metrics?->cents ?? 0);
            $typeLabel = $stepLabels[$step->step_type] ?? ucwords(str_replace('_', ' ', $step->step_type));
        @endphp

        <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            {{-- Primary step row --}}
            <div class="flex items-center gap-4 px-5 py-4 {{ $step->is_published ? '' : 'opacity-70' }}">
                <div class="shrink-0 text-gray-300 dark:text-gray-600" title="Order: #{{ $step->sort_order }}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                        <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                    </svg>
                </div>

                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>{{ $typeLabel }}</span>
                        @if ($step->is_published)
                            <x-filament::badge color="success" size="xs" icon="heroicon-m-bolt">Live</x-filament::badge>
                        @else
                            <x-filament::badge color="gray" size="xs">Draft</x-filament::badge>
                        @endif
                    </div>
                    <a href="{{ $editUrl($step) }}" class="block truncate text-base font-semibold text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300">
                        {{ $step->name }}
                    </a>
                </div>

                <div class="hidden w-20 shrink-0 text-center sm:block">
                    <div class="text-base font-semibold text-gray-900 dark:text-white">—</div>
                    <div class="text-xs text-gray-500">Views</div>
                </div>
                <div class="hidden w-24 shrink-0 text-center sm:block">
                    <div class="text-base font-semibold text-gray-900 dark:text-white">{{ $orderCount }}</div>
                    <div class="text-xs text-gray-500">Conversions</div>
                </div>
                <div class="hidden w-28 shrink-0 text-center sm:block">
                    <div class="text-base font-semibold text-gray-900 dark:text-white">{{ $formatMoney($revenueCents) }}</div>
                    <div class="text-xs text-gray-500">Revenue</div>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                    <a
                        href="{{ $viewUrl($step) }}"
                        class="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                            <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
                        </svg>
                        Preview
                    </a>
                    <a
                        href="{{ $editUrl($step) }}"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                            <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                        </svg>
                    </a>
                </div>
            </div>

            {{-- Nested: order bumps under checkout steps --}}
            @if ($step->step_type === 'checkout')
                @php
                    $bumpEditUrl = fn (\App\Models\FunnelStepBump $b) => \App\Filament\Resources\FunnelStepBumps\FunnelStepBumpResource::getUrl('edit', ['record' => $b]);
                    $bumpCreateUrl = \App\Filament\Resources\FunnelStepBumps\FunnelStepBumpResource::getUrl('create').'?funnel_step_id='.$step->id;
                @endphp
                @foreach ($step->bumps as $bump)
                    <a
                        href="{{ $bumpEditUrl($bump) }}"
                        class="flex items-center gap-4 border-t border-gray-100 bg-gray-50/50 px-5 py-3 pl-14 hover:bg-primary-50/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-primary-500/5"
                    >
                        <div class="shrink-0 text-gray-300 dark:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Order Bump</div>
                            <div class="truncate text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
                                {{ $bump->headline ?: $bump->product?->name ?: 'Unnamed bump' }}
                            </div>
                        </div>
                        @if ($bump->is_active)
                            <x-filament::badge color="success" size="xs">Active</x-filament::badge>
                        @else
                            <x-filament::badge color="gray" size="xs">Inactive</x-filament::badge>
                        @endif
                    </a>
                @endforeach
                <div class="border-t border-gray-100 bg-gray-50/30 px-5 py-3 dark:border-white/5 dark:bg-white/[0.02]">
                    <a
                        href="{{ $bumpCreateUrl }}"
                        class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary-400 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-500/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                        Add Order Bump
                    </a>
                </div>
            @endif

            {{-- Nested: product under upsell/downsell steps --}}
            @if (in_array($step->step_type, ['upsell', 'downsell']) && $step->product)
                <div class="flex items-center gap-4 border-t border-gray-100 bg-gray-50/50 px-5 py-3 pl-14 dark:border-white/5 dark:bg-white/[0.02]">
                    <div class="shrink-0 text-gray-300 dark:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Offer</div>
                        <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{{ $step->product->name }}</div>
                    </div>
                </div>
            @endif
        </div>
    @empty
        <div class="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-5 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <p class="text-sm text-gray-500">No steps yet — add the first one to get started.</p>
        </div>
    @endforelse
</div>
