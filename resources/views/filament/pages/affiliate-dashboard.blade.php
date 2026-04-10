<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Stats Cards --}}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Active Affiliates</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ $activeAffiliates }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Total Commissions</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">${{ number_format($totalCommissions, 2) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Pending Payout</div>
                <div class="text-2xl font-bold text-yellow-600">${{ number_format($pendingCommissions, 2) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">Paid Out</div>
                <div class="text-2xl font-bold text-green-600">${{ number_format($paidCommissions, 2) }}</div>
            </div>
            <div class="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">This Month</div>
                <div class="text-2xl font-bold text-blue-600">${{ number_format($thisMonthCommissions, 2) }}</div>
            </div>
        </div>

        {{-- Top Affiliates --}}
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 border-b dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Affiliates</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Affiliate</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Code</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Rate</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Referrals</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Orders</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Conv %</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Earned</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Pending</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y dark:divide-gray-700">
                        @forelse ($topAffiliates as $a)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td class="px-3 py-2">
                                    <div class="font-medium text-gray-900 dark:text-white">{{ $a['name'] }}</div>
                                    <div class="text-xs text-gray-500">{{ $a['email'] }}</div>
                                </td>
                                <td class="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">{{ $a['code'] }}</td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ $a['rate'] }}%</td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($a['referrals']) }}</td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{{ number_format($a['orders']) }}</td>
                                <td class="px-3 py-2 text-right {{ $a['conversion'] >= 5 ? 'text-green-600' : 'text-gray-600' }}">{{ $a['conversion'] }}%</td>
                                <td class="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">${{ number_format($a['total_earned'], 2) }}</td>
                                <td class="px-3 py-2 text-right text-yellow-600">${{ number_format($a['pending'], 2) }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="8" class="px-3 py-8 text-center text-gray-500">No active affiliates.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        {{-- Recent Commissions --}}
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 border-b dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Commissions</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Date</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Affiliate</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Order</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Order Amount</th>
                            <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Commission</th>
                            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y dark:divide-gray-700">
                        @foreach ($recentCommissions as $c)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ $c->created_at->format('M d, Y') }}</td>
                                <td class="px-3 py-2 text-gray-900 dark:text-white">{{ $c->affiliate?->full_name ?? '—' }}</td>
                                <td class="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">{{ $c->order?->order_number ?? '—' }}</td>
                                <td class="px-3 py-2 text-right text-gray-700 dark:text-gray-300">${{ number_format($c->order_amount_cents / 100, 2) }}</td>
                                <td class="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">${{ number_format($c->commission_cents / 100, 2) }}</td>
                                <td class="px-3 py-2">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                        {{ $c->status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                           ($c->status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                           ($c->status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300')) }}">
                                        {{ ucfirst($c->status) }}
                                    </span>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
