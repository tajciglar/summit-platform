<x-filament-panels::page>
    <div class="space-y-4">
        <div>
            <input wire:model.live.debounce.300ms="search" type="text" placeholder="Search speakers..."
                class="rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-64" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            @forelse ($speakers as $speaker)
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ $speaker['name'] }}</h3>
                            @if ($speaker['email'])
                                <p class="text-xs text-gray-500 dark:text-gray-400">{{ $speaker['email'] }}</p>
                            @endif
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {{ $speaker['total_appearances'] }} summits
                            </span>
                            @if ($speaker['upcoming'] > 0)
                                <span class="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    {{ $speaker['upcoming'] }} active
                                </span>
                            @endif
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        @foreach ($speaker['bookings'] as $booking)
                            <div class="flex items-center justify-between text-sm py-1 px-2 rounded {{ $booking['status'] === 'published' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50' }}">
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-700 dark:text-gray-300">{{ Str::limit($booking['summit'], 35) }}</span>
                                    @if ($booking['is_featured'])
                                        <span class="text-[10px] px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Featured</span>
                                    @endif
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-400">{{ $booking['presentation_day'] ?? 'TBD' }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            @empty
                <div class="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    No speakers with summit assignments found.
                </div>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
