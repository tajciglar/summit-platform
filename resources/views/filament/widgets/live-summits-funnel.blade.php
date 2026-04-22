<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Live summits</x-slot>

        @php($rows = $this->getData())

        @if ($rows->isEmpty())
            <p class="text-sm text-gray-500">No summits are live on this domain right now.</p>
        @else
            <div class="space-y-6">
                @foreach ($rows as $row)
                    @php($summit = $row['summit'])
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div class="mb-3 flex items-center justify-between">
                            <div>
                                <div class="text-base font-semibold">{{ $summit->title }}</div>
                                <div class="text-xs text-gray-500">
                                    live ·
                                    {{ $summit->pre_summit_starts_at?->toFormattedDateString() }}
                                    –
                                    {{ $summit->ends_at?->toFormattedDateString() }}
                                </div>
                            </div>
                        </div>
                        <hr class="my-2 border-t border-gray-100 dark:border-gray-800" />
                        @include('filament.widgets.partials.funnel-bar', ['report' => $row['report']])
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
