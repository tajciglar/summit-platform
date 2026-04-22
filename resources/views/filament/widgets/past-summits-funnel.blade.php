<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Past summits</x-slot>

        @php($summits = $this->getSummits())

        @if ($summits->isEmpty())
            <p class="text-sm text-gray-500">No past summits on this domain yet.</p>
        @else
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                @foreach ($summits as $summit)
                    @php($isOpen = $this->expanded[$summit->id] ?? false)
                    <div class="py-3">
                        <button
                            type="button"
                            wire:click="toggleExpanded('{{ $summit->id }}')"
                            class="w-full flex items-center justify-between text-left"
                        >
                            <div>
                                <span class="font-medium">{{ $summit->title }}</span>
                                <span class="ml-2 text-xs text-gray-500">
                                    ended {{ $summit->ends_at?->toFormattedDateString() }}
                                </span>
                            </div>
                            <span class="text-sm text-gray-400">{{ $isOpen ? '▾' : '▸' }}</span>
                        </button>

                        @if ($isOpen)
                            <div class="mt-3">
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
