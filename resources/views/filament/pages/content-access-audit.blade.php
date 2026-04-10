<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Stats --}}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Total Grants</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($totalGrants) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">VIP Access</div>
                <div class="text-2xl font-bold text-purple-600">{{ number_format($vipGrants) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Active</div>
                <div class="text-2xl font-bold text-green-600">{{ number_format($activeGrants) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Expired</div>
                <div class="text-2xl font-bold text-red-600">{{ number_format($expiredGrants) }}</div>
            </div>
        </div>

        {{-- Filters --}}
        <div class="flex flex-wrap gap-4">
            <input wire:model.live.debounce.300ms="search" type="text" placeholder="Search by email or name..."
                class="rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-64" />
            <select wire:model.live="accessLevel" class="rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                <option value="">All Levels</option>
                <option value="free">Free</option>
                <option value="vip">VIP</option>
            </select>
            <select wire:model.live="expiry" class="rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                <option value="">All Expiry</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired</option>
                <option value="never">Never Expires</option>
            </select>
        </div>

        {{-- Table --}}
        <div class="overflow-x-auto rounded-xl border dark:border-gray-700">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">User</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Summit</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Level</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Granted</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Expires</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Via Order</th>
                    </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-700">
                    @forelse ($grants as $grant)
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-3 py-2">
                                <div class="font-medium text-gray-900 dark:text-white">{{ $grant->user?->name ?? '—' }}</div>
                                <div class="text-xs text-gray-500">{{ $grant->user?->email ?? '—' }}</div>
                            </td>
                            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ Str::limit($grant->summit?->title ?? '—', 30) }}</td>
                            <td class="px-3 py-2">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                    {{ $grant->access_level === 'vip' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }}">
                                    {{ ucfirst($grant->access_level) }}
                                </span>
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ $grant->granted_at?->format('M d, Y H:i') ?? '—' }}</td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ $grant->expires_at?->format('M d, Y H:i') ?? 'Never' }}</td>
                            <td class="px-3 py-2">
                                @if ($grant->isExpired())
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Expired</span>
                                @else
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</span>
                                @endif
                            </td>
                            <td class="px-3 py-2 font-mono text-xs text-gray-500">{{ $grant->order?->order_number ?? '—' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="px-3 py-8 text-center text-gray-500">No access grants found.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-4">
            {{ $grants->links() }}
        </div>
    </div>
</x-filament-panels::page>
