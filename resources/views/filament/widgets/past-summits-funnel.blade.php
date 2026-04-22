<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Past summits</x-slot>

        @php
            $summits = $this->getSummits();
        @endphp

        @if ($summits->isEmpty())
            <div class="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No past summits on this domain yet.
            </div>
        @else
            <div class="divide-y divide-gray-100 dark:divide-white/5">
                @foreach ($summits as $summit)
                    @php
                        $isOpen = $this->expanded[$summit->id] ?? false;
                    @endphp
                    <div class="py-2">
                        <button
                            type="button"
                            wire:click="toggleExpanded('{{ $summit->id }}')"
                            class="w-full flex items-center justify-between text-left rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <div class="flex items-center gap-3 min-w-0">
                                <span class="inline-flex h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0"></span>
                                <span class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ $summit->title }}</span>
                                <span class="text-xs text-gray-500 shrink-0">
                                    ended {{ $summit->ends_at?->toFormattedDateString() }}
                                </span>
                            </div>
                            <svg
                                class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 {{ $isOpen ? 'rotate-90' : '' }}"
                                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        @if ($isOpen)
                            <div class="mt-3 mx-3 p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                                @include('filament.widgets.partials.funnel-bar', [
                                    'report' => $this->getReport($summit),
                                ])
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
