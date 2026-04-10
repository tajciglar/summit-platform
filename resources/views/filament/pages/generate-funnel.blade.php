<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Status banner --}}
        @if ($healthy)
            <div class="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-3">
                <x-heroicon-o-check-circle class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                    <p class="text-sm font-medium text-green-800 dark:text-green-300">FunnelForge is connected</p>
                    <p class="text-xs text-green-600 dark:text-green-400">{{ $funnelforgeUrl }}</p>
                </div>
            </div>
        @else
            <div class="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
                <x-heroicon-o-x-circle class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                    <p class="text-sm font-medium text-red-800 dark:text-red-300">FunnelForge is not reachable</p>
                    <p class="text-xs text-red-600 dark:text-red-400">
                        Expected at <code class="font-mono">{{ $funnelforgeUrl }}</code>.
                        Start it with <code class="font-mono">npm run demo</code> in the FunnelForge directory.
                    </p>
                </div>
            </div>
        @endif

        {{-- How it works --}}
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 p-6">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">How it works</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="flex gap-3">
                    <span class="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-bold">1</span>
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Configure</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Pick a summit, name, audience, and event type</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <span class="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-bold">2</span>
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Generate</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">AI creates opt-in, VIP, upsell, and thank-you pages</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <span class="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-bold">3</span>
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Review</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Steps appear in the Funnel editor for fine-tuning</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <span class="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-bold">4</span>
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">Publish</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Activate the funnel when you are ready to go live</p>
                    </div>
                </div>
            </div>
        </div>

        {{-- Prompt: click the Generate button in the header --}}
        <div class="text-center py-8 text-gray-400 dark:text-gray-500">
            <x-heroicon-o-sparkles class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p class="text-sm">Click <strong>Generate Funnel</strong> in the top-right to get started.</p>
        </div>
    </div>
</x-filament-panels::page>
