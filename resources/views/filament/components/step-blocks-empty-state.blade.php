@php
    /** @var \App\Models\FunnelStep $step */
    $step = $getRecord();
    $funnel = $step?->funnel;
    $registry = app(\App\Services\Templates\TemplateRegistry::class);

    $familyKey = $funnel?->template_key;
    if (! $familyKey && $funnel) {
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
        : null;

    $goldenKey = \App\Services\Templates\GoldenTemplates::keyForStepType((string) ($step?->step_type ?? ''));
    $goldenLabel = match ($goldenKey) {
        'aps-parenting' => 'APS Parenting (optin)',
        'aps-vip' => 'APS VIP Upgrade',
        default => null,
    };
@endphp

<div class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center dark:border-white/10 dark:bg-white/5">
    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
    </div>
    <div class="space-y-1">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">No blocks yet</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            @if ($goldenLabel)
                Generate starter sections from
                <span class="font-medium text-gray-700 dark:text-gray-200">{{ $goldenLabel }}</span>
                — every section becomes an editable block.
            @elseif ($familyLabel)
                Add blocks or generate a full page using
                <span class="font-medium text-gray-700 dark:text-gray-200">{{ $familyLabel }}</span>.
            @else
                Add blocks from scratch.
            @endif
        </p>
    </div>

    @if ($goldenKey)
        <button
            type="button"
            wire:click="seedFromGoldenTemplate"
            class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd" />
            </svg>
            Generate blocks from {{ $goldenLabel }}
        </button>
    @endif
</div>
