@php
    /** @var \App\Models\FunnelStep $currentStep */
    /** @var \App\Models\Funnel $funnel */
    /** @var \App\Services\Templates\TemplateRegistry $registry */
    $registry = app(\App\Services\Templates\TemplateRegistry::class);

    // Steps for the sidebar — ordered
    $steps = $funnel->steps()
        ->orderBy('sort_order')
        ->get(['id', 'name', 'slug', 'step_type', 'sort_order', 'is_published']);

    // Family/skin label: funnel-level template_key if set, otherwise the optin
    // step's published draft template. Falls back to an em-dash.
    $familyKey = $funnel->template_key;
    if (! $familyKey) {
        $publishedDraft = \App\Models\LandingPageBatch::query()
            ->where('funnel_id', $funnel->id)
            ->with([
                'drafts' => fn ($q) => $q
                    ->where('status', \App\Enums\LandingPageDraftStatus::Published)
                    ->latest('landing_page_drafts.updated_at')
                    ->limit(1),
            ])
            ->get()
            ->pluck('drafts')
            ->flatten()
            ->first();
        $familyKey = $publishedDraft?->template_key;
    }

    $familyLabel = ($familyKey && $registry->exists($familyKey))
        ? ($registry->get($familyKey)['label'] ?? $familyKey)
        : '—';

    // Swatch: first palette color of the family's publishedDraft, if any.
    $swatchDraft = isset($publishedDraft) ? $publishedDraft : null;
    $swatches = $swatchDraft
        ? array_slice(array_values((array) ($swatchDraft->palette ?? [])), 0, 3)
        : [];

    // Revenue/conv per funnel in the last 7 days.
    $since = now()->subDays(7);
    $stats = \App\Models\Order::query()
        ->where('funnel_id', $funnel->id)
        ->where('status', 'completed')
        ->where('created_at', '>=', $since)
        ->selectRaw('COUNT(*) as conv, COALESCE(SUM(total_cents), 0) as cents')
        ->first();

    $conv = (int) ($stats->conv ?? 0);
    $revenueCents = (int) ($stats->cents ?? 0);
    $views = 0; // TODO: wire page-view analytics; currently not tracked.

    $funnelsIndexUrl = \App\Filament\Resources\Funnels\FunnelResource::getUrl('index');
    $funnelEditUrl = \App\Filament\Resources\Funnels\FunnelResource::getUrl('edit', ['record' => $funnel->id]);
    $stepEditUrl = fn (\App\Models\FunnelStep $s) =>
        \App\Filament\Resources\FunnelSteps\FunnelStepResource::getUrl('edit', ['record' => $s->id]);
    $stepCreateUrl = \App\Filament\Resources\FunnelSteps\FunnelStepResource::getUrl('create')
        .'?funnel_id='.$funnel->id;

    $formatMoney = fn (int $cents) => '$'.number_format($cents / 100, 2);

    $stepLabels = [
        'optin' => 'Optin',
        'sales_page' => 'Sales Page',
        'checkout' => 'Checkout',
        'upsell' => 'Upsell',
        'downsell' => 'Downsell',
        'thank_you' => 'Thank you',
    ];
@endphp

<aside class="fi-funnel-drawer flex h-full w-60 shrink-0 flex-col gap-6 border-r border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
    {{-- Funnel header --}}
    <div class="flex flex-col gap-2">
        <a href="{{ $funnelsIndexUrl }}"
           class="text-[11px] font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:text-gray-400">
            Funnel
        </a>
        <a href="{{ $funnelEditUrl }}"
           class="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clip-rule="evenodd" />
            </svg>
            {{ $funnel->name }}
        </a>
        <div class="flex items-center gap-2">
            <span class="flex items-center">
                @forelse ($swatches as $hex)
                    <span class="-ml-0.5 h-4 w-4 rounded-full border border-white ring-1 ring-gray-200 dark:ring-white/10"
                          style="background: {{ $hex }};"></span>
                @empty
                    <span class="h-4 w-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-400"></span>
                @endforelse
            </span>
            <span class="text-xs text-gray-600 dark:text-gray-300">{{ $familyLabel }}</span>
        </div>
    </div>

    {{-- Steps --}}
    <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Steps</span>
            <a href="{{ $stepCreateUrl }}"
               class="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                + Add
            </a>
        </div>

        <ul class="flex flex-col gap-1">
            @foreach ($steps as $step)
                @php
                    $isCurrent = $step->id === $currentStep->id;
                    $label = $stepLabels[$step->step_type] ?? ucwords(str_replace('_', ' ', $step->step_type));
                @endphp
                <li>
                    <a href="{{ $stepEditUrl($step) }}"
                       @class([
                           'group flex items-start justify-between gap-2 rounded-md px-3 py-2',
                           'bg-primary-50 ring-1 ring-primary-200 dark:bg-primary-500/10 dark:ring-primary-400/20' => $isCurrent,
                           'hover:bg-gray-50 dark:hover:bg-white/5' => ! $isCurrent,
                       ])>
                        <span class="min-w-0 flex-1">
                            <span @class([
                                'block truncate text-sm',
                                'font-semibold text-primary-700 dark:text-primary-300' => $isCurrent,
                                'font-medium text-gray-900 dark:text-gray-100' => ! $isCurrent,
                            ])>{{ $step->name }}</span>
                            <span class="block truncate font-mono text-[11px] text-gray-500 dark:text-gray-400">/{{ $step->slug }}</span>
                        </span>
                        <span @class([
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            'bg-emerald-500' => $step->is_published,
                            'bg-gray-300 dark:bg-gray-600' => ! $step->is_published,
                        ])
                        title="{{ $step->is_published ? 'Published' : 'Draft' }}"></span>
                    </a>
                </li>
            @endforeach
        </ul>
    </div>

    {{-- 7-day stats --}}
    <div class="mt-auto flex flex-col gap-1.5 border-t border-gray-100 pt-4 dark:border-white/10">
        <span class="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Funnel · 7D</span>
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-300">Views</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ number_format($views) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-300">Conv</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ number_format($conv) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-300">Revenue</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ $formatMoney($revenueCents) }}</span>
        </div>
    </div>
</aside>
