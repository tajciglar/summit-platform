<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Live summits</x-slot>

        @php
            $rows = $this->getData();
        @endphp

        @if ($rows->isEmpty())
            <div class="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                No summits are live on this domain right now.
            </div>
        @else
            <div class="space-y-4">
                @foreach ($rows as $row)
                    @php
                        $summit = $row['summit'];
                        $start = $summit->pre_summit_starts_at;
                        $end = $summit->ends_at;
                        $now = now();
                        $totalDays = $start && $end ? max(1, (int) $start->diffInDays($end) + 1) : null;
                        $currentDay = $start && $end ? min($totalDays, (int) $start->diffInDays($now) + 1) : null;
                        $progress = $totalDays ? round(($currentDay / $totalDays) * 100, 1) : null;
                    @endphp
                    @php
                        $viewUrl = \App\Filament\Resources\Summits\SummitResource::getUrl('view', ['record' => $summit]);
                        $editUrl = \App\Filament\Resources\Summits\SummitResource::getUrl('edit', ['record' => $summit]);
                    @endphp
                    <div class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 p-5 shadow-sm">
                        <div class="mb-4 flex items-start justify-between gap-4">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="relative flex h-2 w-2">
                                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    </span>
                                    <span class="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                                        live
                                    </span>
                                    @if ($currentDay && $totalDays)
                                        <span class="text-xs text-gray-500">Day {{ $currentDay }} of {{ $totalDays }}</span>
                                    @endif
                                </div>
                                <div class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">{{ $summit->title }}</div>
                                <div class="text-xs text-gray-500">
                                    {{ $start?->toFormattedDateString() }} – {{ $end?->toFormattedDateString() }}
                                </div>
                            </div>
                            <div class="flex shrink-0 items-center gap-2">
                                <a href="{{ $viewUrl }}" class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    View
                                </a>
                                <a href="{{ $editUrl }}" class="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                                    Edit
                                </a>
                            </div>
                        </div>

                        @if ($progress !== null)
                            <div class="mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                                <div class="h-full rounded-full bg-emerald-500/70" style="width: {{ $progress }}%"></div>
                            </div>
                        @endif

                        <livewire:summit-analytics-block :summit="$summit" :key="'summit-analytics-'.$summit->id" />
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
