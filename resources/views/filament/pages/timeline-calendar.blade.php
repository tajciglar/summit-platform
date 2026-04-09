<x-filament-panels::page>
    <div class="space-y-4">
        {{-- Filters --}}
        <div class="flex flex-wrap items-center gap-4">
            <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                <select wire:model.live="year" class="mt-1 block rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                    @for ($y = date('Y') - 1; $y <= date('Y') + 2; $y++)
                        <option value="{{ $y }}">{{ $y }}</option>
                    @endfor
                </select>
            </div>
            <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select wire:model.live="typeFilter" class="mt-1 block rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                    <option value="">All</option>
                    <option value="new">New</option>
                    <option value="replay">Replay</option>
                </select>
            </div>
            <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <input wire:model.live.debounce.300ms="search" type="text" placeholder="Summit name..."
                    class="mt-1 block rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
            </div>
        </div>

        {{-- Legend --}}
        <div class="flex flex-wrap gap-3 text-xs">
            @foreach ($activityColors as $type => $color)
                <div class="flex items-center gap-1.5">
                    <span class="inline-block w-3 h-3 rounded" style="background: {{ $color }}"></span>
                    <span class="text-gray-600 dark:text-gray-400">{{ str_replace('_', ' ', ucfirst($type)) }}</span>
                </div>
            @endforeach
        </div>

        {{-- Timeline Grid --}}
        <div class="overflow-x-auto border rounded-xl dark:border-gray-700">
            <table class="min-w-full text-xs">
                <thead>
                    {{-- Month row --}}
                    <tr class="bg-gray-50 dark:bg-gray-800">
                        <th class="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-1 text-left font-semibold text-gray-700 dark:text-gray-300 min-w-[200px]">
                            Summit
                        </th>
                        @php $prevMonth = ''; @endphp
                        @foreach ($weeks as $week)
                            @if ($week['month'] !== $prevMonth)
                                @php
                                    $colspan = collect($weeks)->where('month', $week['month'])->count();
                                    $prevMonth = $week['month'];
                                @endphp
                                <th colspan="{{ $colspan }}" class="px-1 py-1 text-center font-semibold text-gray-600 dark:text-gray-400 border-l dark:border-gray-700">
                                    {{ $week['month'] }}
                                </th>
                            @endif
                        @endforeach
                    </tr>
                    {{-- Week row --}}
                    <tr class="bg-gray-50 dark:bg-gray-800">
                        <th class="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-1"></th>
                        @foreach ($weeks as $week)
                            <th class="px-0.5 py-1 text-center text-gray-400 dark:text-gray-500 font-normal border-l dark:border-gray-700 min-w-[40px]">
                                {{ $week['label'] }}
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @forelse ($summits as $summit)
                        <tr class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="sticky left-0 z-10 bg-white dark:bg-gray-900 px-3 py-2 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                <a href="{{ \App\Filament\Resources\Summits\SummitResource::getUrl('edit', ['record' => $summit['id']]) }}"
                                   class="hover:underline">
                                    {{ $summit['title'] }}
                                </a>
                                <span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
                                    {{ $summit['type'] === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }}">
                                    {{ ucfirst($summit['type']) }}
                                </span>
                            </td>
                            @foreach ($weeks as $week)
                                @php
                                    $weekStart = $week['start']->format('Y-m-d');
                                    $weekEnd = $week['end']->format('Y-m-d');
                                    $activity = $summit['activities']->first(function ($a) use ($weekStart, $weekEnd) {
                                        return $a['starts_at'] <= $weekEnd && $a['ends_at'] >= $weekStart;
                                    });
                                @endphp
                                <td class="px-0 py-1 border-l dark:border-gray-700 text-center">
                                    @if ($activity)
                                        <div class="mx-0.5 h-5 rounded flex items-center justify-center text-white text-[9px] font-medium truncate"
                                             style="background: {{ $activity['color'] }}"
                                             title="{{ $activity['label'] }}: {{ $activity['starts_at'] }} – {{ $activity['ends_at'] }}">
                                            {{ \Illuminate\Support\Str::limit($activity['label'], 6, '') }}
                                        </div>
                                    @endif
                                </td>
                            @endforeach
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ count($weeks) + 1 }}" class="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                No summits with campaign activities for {{ $year }}.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{-- Annotations --}}
        @if ($annotations->isNotEmpty())
            <div class="mt-4">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes & Holidays</h3>
                <div class="flex flex-wrap gap-2">
                    @foreach ($annotations as $annotation)
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            {{ $annotation->annotation_type === 'holiday' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }}">
                            {{ $annotation->date->format('M d') }}: {{ $annotation->label }}
                        </span>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
