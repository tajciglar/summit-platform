@php
    /** @var \App\Models\FunnelStep $step */
    $step = $getRecord();
    $isPublished = (bool) ($step?->is_published ?? false);
    $funnel = $step?->funnel;
    $liveUrl = $funnel ? '/'.$funnel->slug.'/'.$step->slug : null;
@endphp

<div class="flex w-full items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5">
    <span @class([
        'h-2 w-2 shrink-0 rounded-full',
        'bg-emerald-500' => $isPublished,
        'bg-gray-300 dark:bg-gray-600' => ! $isPublished,
    ])></span>

    @if ($isPublished)
        <span class="text-gray-700 dark:text-gray-200">Published — live at</span>
        <span class="truncate font-mono text-[13px] text-gray-900 dark:text-white">{{ $liveUrl }}</span>
    @else
        <span class="text-gray-500 dark:text-gray-400">Not published · preview only</span>
    @endif
</div>
