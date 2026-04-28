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
                        $openUrl = \App\Filament\Resources\Summits\SummitResource::getUrl('view', ['record' => $summit]);
                    @endphp
                    <div x-data="{ open: false }" class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 p-5 shadow-sm">
                        <div class="flex items-start justify-between gap-4">
                            <button type="button" @click="open = !open" class="group flex flex-1 items-start gap-3 text-left">
                                <svg class="mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform" :class="open ? 'rotate-90' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
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
                                    <div class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{{ $summit->title }}</div>
                                    <div class="text-xs text-gray-500" x-show="open" x-cloak>
                                        {{ $start?->toFormattedDateString() }} – {{ $end?->toFormattedDateString() }}
                                    </div>
                                </div>
                            </button>
                            <div class="flex shrink-0 items-center gap-2">
                                <a href="{{ $openUrl }}" class="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                                    Open
                                </a>
                            </div>
                        </div>

                        <div x-show="open" x-cloak x-transition.opacity class="mt-4">
                            @if ($progress !== null)
                                <div class="mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                                    <div class="h-full rounded-full bg-emerald-500/70" style="width: {{ $progress }}%"></div>
                                </div>
                            @endif

                            <livewire:summit-analytics-block lazy :summit="$summit" :key="'summit-analytics-'.$summit->id" />
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
