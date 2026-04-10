<x-filament-panels::page>
    <div class="space-y-4">
        {{-- Filters bar --}}
        <div class="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-sm">
            <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
                <div class="flex items-center gap-1">
                    <button wire:click="$set('year', {{ $year - 1 }})" class="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span class="w-14 text-center text-sm font-bold text-gray-900 dark:text-white">{{ $year }}</span>
                    <button wire:click="$set('year', {{ $year + 1 }})" class="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                <select wire:model.live="typeFilter" class="block w-28 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500">
                    <option value="">All</option>
                    <option value="new">New</option>
                    <option value="replay">Replay</option>
                </select>
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input wire:model.live.debounce.300ms="search" type="text" placeholder="Search summits..."
                        class="block w-full pl-9 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500" />
                </div>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500 pb-2">
                <span class="font-semibold text-gray-600 dark:text-gray-300">{{ count($summits) }}</span> summits
            </span>
        </div>

        {{-- Legend --}}
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
            @foreach ($activityColors as $type => $color)
                <div class="flex items-center gap-1.5">
                    <span class="inline-block w-3.5 h-2.5 rounded" style="background: {{ $color }}"></span>
                    <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400">{{ str_replace('_', ' ', ucfirst($type)) }}</span>
                </div>
            @endforeach
            <div class="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <span class="inline-block w-3.5 h-2.5 rounded bg-primary-200 dark:bg-primary-800 border border-primary-400 dark:border-primary-600"></span>
                <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400">This week</span>
            </div>
        </div>

        {{-- Timeline Grid --}}
        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900" style="scrollbar-width: thin;">
            @php
                $currentWeekStart = now()->startOfWeek(\Carbon\Carbon::MONDAY)->format('Y-m-d');
                $cellW = 32;
            @endphp
            <table class="text-xs border-collapse" style="min-width: {{ 200 + count($weeks) * $cellW }}px;">
                <thead class="sticky top-0 z-20">
                    {{-- Month header --}}
                    <tr class="bg-gray-50 dark:bg-gray-800/80">
                        <th class="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800/80 min-w-[200px] px-3 py-2 text-left border-b border-r border-gray-200 dark:border-gray-700">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Summit</span>
                        </th>
                        @php $prevMonth = ''; @endphp
                        @foreach ($weeks as $week)
                            @if ($week['month'] !== $prevMonth)
                                @php
                                    $colspan = collect($weeks)->where('month', $week['month'])->count();
                                    $prevMonth = $week['month'];
                                @endphp
                                <th colspan="{{ $colspan }}" class="px-1 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-l border-gray-200 dark:border-gray-700">
                                    {{ $week['month'] }}
                                </th>
                            @endif
                        @endforeach
                    </tr>
                    {{-- Week number header --}}
                    <tr class="bg-white dark:bg-gray-900">
                        <th class="sticky left-0 z-30 bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-700 h-5"></th>
                        @foreach ($weeks as $week)
                            @php $isCurrentWeek = $week['start']->format('Y-m-d') === $currentWeekStart; @endphp
                            <th class="px-0 py-1 text-center font-normal border-b border-l border-gray-100 dark:border-gray-800 {{ $isCurrentWeek ? 'bg-primary-100/60 dark:bg-primary-900/30' : '' }}" style="min-width: {{ $cellW }}px;">
                                <span class="text-[10px] {{ $isCurrentWeek ? 'text-primary-700 dark:text-primary-400 font-bold' : 'text-gray-300 dark:text-gray-700' }}">
                                    {{ $week['start']->format('d') }}
                                </span>
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @forelse ($summits as $index => $summit)
                        <tr class="group border-b border-gray-100 dark:border-gray-800/60 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                            {{-- Summit name (sticky) --}}
                            <td class="sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
                                <div class="flex items-center gap-2 max-w-[180px]">
                                    <span class="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-[8px] font-bold uppercase
                                        {{ $summit['type'] === 'new' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400' }}">
                                        {{ $summit['type'] === 'new' ? 'N' : 'R' }}
                                        <span class="sr-only">{{ $summit['type'] === 'new' ? 'New' : 'Replay' }}</span>
                                    </span>
                                    <a href="{{ \App\Filament\Resources\Summits\SummitResource::getUrl('edit', ['record' => $summit['id']]) }}"
                                       class="text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 truncate transition-colors"
                                       title="{{ $summit['title'] }}">
                                        {{ $summit['title'] }}
                                    </a>
                                </div>
                            </td>
                            {{-- Week cells --}}
                            @foreach ($weeks as $week)
                                @php
                                    $weekStart = $week['start']->format('Y-m-d');
                                    $weekEnd = $week['end']->format('Y-m-d');
                                    $isCurrentWeek = $weekStart === $currentWeekStart;
                                    $activity = $summit['activities']->first(function ($a) use ($weekStart, $weekEnd) {
                                        return $a['starts_at'] <= $weekEnd && $a['ends_at'] >= $weekStart;
                                    });
                                @endphp
                                <td class="px-0 py-[3px] border-l border-gray-50 dark:border-gray-800/40 {{ $isCurrentWeek ? 'bg-primary-100/40 dark:bg-primary-900/15' : '' }}">
                                    @if ($activity)
                                        <div class="mx-px h-5 rounded flex items-center justify-center text-white cursor-default"
                                             style="background: {{ $activity['color'] }};"
                                             title="{{ $activity['label'] }} — {{ \Carbon\Carbon::parse($activity['starts_at'])->format('M d') }} to {{ \Carbon\Carbon::parse($activity['ends_at'])->format('M d') }}">
                                            <span class="text-[9px] font-bold uppercase tracking-wide opacity-90">
                                                {{ \Illuminate\Support\Str::limit($activity['label'], 4, '') }}
                                            </span>
                                        </div>
                                    @endif
                                </td>
                            @endforeach
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ count($weeks) + 1 }}" class="px-6 py-20 text-center">
                                <div class="flex flex-col items-center gap-2">
                                    <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                    <p class="text-sm font-medium text-gray-400 dark:text-gray-500">No summits with campaign activities for {{ $year }}</p>
                                    <p class="text-xs text-gray-300 dark:text-gray-600">Add campaign activities to a summit to see them here</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{-- Annotations --}}
        @if ($annotations->isNotEmpty())
            <div class="rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-sm p-4">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Notes & Holidays</h3>
                <div class="flex flex-wrap gap-2">
                    @foreach ($annotations as $annotation)
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                            {{ $annotation->annotation_type === 'holiday' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : ($annotation->annotation_type === 'market_event' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700') }}">
                            <span class="font-semibold">{{ $annotation->date->format('M d') }}</span>
                            <span>{{ $annotation->label }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
