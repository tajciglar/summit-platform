<x-filament-widgets::widget>
    <x-filament::section heading="Summit Performance Comparison" icon="heroicon-o-chart-bar">
        @php $summits = $this->getData(); @endphp
        @if ($summits->isEmpty())
            <p class="text-sm text-gray-500 dark:text-gray-400">No published summits yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b dark:border-gray-700">
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Summit</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Type</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Optins</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Orders</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Conv %</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">AOV</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y dark:divide-gray-700">
                        @foreach ($summits as $s)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td class="px-3 py-2 font-medium text-gray-900 dark:text-white">
                                    <a href="{{ \App\Filament\Resources\Summits\SummitResource::getUrl('edit', ['record' => $s['id']]) }}" class="hover:underline">
                                        {{ Str::limit($s['title'], 40) }}
                                    </a>
                                </td>
                                <td class="px-3 py-2">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {{ $s['type'] === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }}">
                                        {{ ucfirst($s['type']) }}
                                    </span>
                                </td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($s['optins']) }}</td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($s['orders']) }}</td>
                                <td class="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">${{ number_format($s['revenue'], 2) }}</td>
                                <td class="px-3 py-2 text-right {{ $s['conversion'] >= 5 ? 'text-green-600' : ($s['conversion'] >= 3 ? 'text-yellow-600' : 'text-red-600') }}">
                                    {{ $s['conversion'] }}%
                                </td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">${{ number_format($s['aov'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
