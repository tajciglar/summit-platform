<x-filament-widgets::widget>
    <x-filament::section heading="Coupon Performance" icon="heroicon-o-ticket">
        @php $coupons = $this->getData(); @endphp
        @if ($coupons->isEmpty())
            <p class="text-sm text-gray-500 dark:text-gray-400">No coupons with orders yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b dark:border-gray-700">
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Code</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Type</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Summit</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Uses</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Discount Given</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Expires</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y dark:divide-gray-700">
                        @foreach ($coupons as $c)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td class="px-3 py-2 font-mono font-medium text-gray-900 dark:text-white">{{ $c['code'] }}</td>
                                <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ $c['type'] }}</td>
                                <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ Str::limit($c['summit'] ?? 'All', 25) }}</td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ $c['uses'] }} / {{ $c['max_uses'] }}</td>
                                <td class="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">${{ number_format($c['revenue'], 2) }}</td>
                                <td class="px-3 py-2 text-right text-red-600">${{ number_format($c['discount_given'], 2) }}</td>
                                <td class="px-3 py-2">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {{ $c['is_active'] ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }}">
                                        {{ $c['is_active'] ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td class="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{{ $c['expires_at'] ?? 'Never' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
