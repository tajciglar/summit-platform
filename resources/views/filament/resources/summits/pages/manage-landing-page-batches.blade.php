<x-filament-panels::page>
    @php $batches = $this->getBatches(); @endphp

    @if ($batches->isEmpty())
        <div class="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <x-heroicon-o-sparkles class="mx-auto mb-4 h-12 w-12 opacity-40" />
            <p class="text-lg font-medium">No landing pages generated yet.</p>
            <p class="mt-1 text-sm">Click "Generate Landing Pages" above to create your first batch.</p>
        </div>
    @else
        <div class="space-y-8">
            @foreach ($batches as $batch)
                <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    {{-- Batch header --}}
                    <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div>
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">
                                Batch · {{ $batch->created_at->format('M j, Y H:i') }}
                            </span>
                            <span class="ml-3 text-xs text-gray-500">
                                {{ $batch->version_count }} version(s) · funnel: {{ $batch->funnel?->name ?? '—' }}
                            </span>
                        </div>
                        <x-filament::badge :color="match($batch->status) {
                            'completed' => 'success',
                            'running'   => 'warning',
                            'failed'    => 'danger',
                            default     => 'gray',
                        }">
                            {{ ucfirst($batch->status) }}
                        </x-filament::badge>
                    </div>

                    {{-- Draft cards --}}
                    <div class="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        @foreach ($batch->drafts as $draft)
                            <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                <div class="mb-3 flex items-center justify-between">
                                    <span class="font-medium text-gray-900 dark:text-white">
                                        Version {{ $draft->version_number }}
                                    </span>
                                    <x-filament::badge :color="match($draft->status) {
                                        'ready'      => 'info',
                                        'approved'   => 'success',
                                        'rejected'   => 'danger',
                                        'generating' => 'warning',
                                        'failed'     => 'danger',
                                        default      => 'gray',
                                    }">
                                        {{ ucfirst($draft->status) }}
                                    </x-filament::badge>
                                </div>

                                @if ($draft->status === 'failed')
                                    <p class="mb-3 text-xs text-red-500">{{ $draft->error_message }}</p>
                                @endif

                                <div class="flex flex-wrap gap-2">
                                    @if (in_array($draft->status, ['ready', 'approved']))
                                        @php
                                            $previewUrl = config('next.url') . '/preview/' . $draft->preview_token;
                                        @endphp
                                        <a
                                            href="{{ $previewUrl }}"
                                            target="_blank"
                                            class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            <x-heroicon-o-arrow-top-right-on-square class="h-3 w-3" />
                                            Preview
                                        </a>
                                    @endif

                                    @if ($draft->status === 'ready' && $batch->status === 'running')
                                        <button
                                            wire:click="approveDraft('{{ $draft->id }}')"
                                            wire:confirm="Approve version {{ $draft->version_number }}? This will overwrite the current optin step blocks."
                                            class="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                        >
                                            <x-heroicon-o-check class="h-3 w-3" />
                                            Approve
                                        </button>

                                        <button
                                            wire:click="rejectDraft('{{ $draft->id }}')"
                                            class="inline-flex items-center gap-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                                        >
                                            <x-heroicon-o-x-mark class="h-3 w-3" />
                                            Reject
                                        </button>
                                    @endif
                                </div>
                            </div>
                        @endforeach

                        @if ($batch->drafts->isEmpty())
                            <p class="col-span-full text-sm text-gray-500">Drafts queuing…</p>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</x-filament-panels::page>
