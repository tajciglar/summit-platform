@php
    /** @var \Illuminate\Support\Collection<int, \App\Models\LandingPageDraft> $drafts */
    /** @var string $generateUrl */
    /** @var string|null $funnelId */
    $previewBase = rtrim((string) config('next.url'), '/');
@endphp

<div class="flex flex-col gap-3">
    <div class="flex items-center justify-end">
        <a
            href="{{ $generateUrl }}"
            class="fi-btn fi-btn-size-sm inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
            style="background: var(--primary-600)"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clip-rule="evenodd" />
            </svg>
            <span>Generate variants</span>
        </a>
    </div>

    @if ($drafts->isEmpty())
        <div class="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-white/10">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                No landing pages yet. Click "Generate variants" to kick off AI generation.
            </p>
        </div>
    @else
        <div class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 dark:divide-white/5 dark:border-white/10">
            @foreach ($drafts as $draft)
                @php
                    $editUrl = \App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage::getUrl([
                        'record' => $funnelId,
                        'draft' => $draft->id,
                    ]);
                    $previewUrl = $previewBase && $draft->preview_token
                        ? "{$previewBase}/preview/{$draft->preview_token}"
                        : null;
                    $isPublished = $draft->status === 'published';
                    $isDone = in_array($draft->status, ['ready', 'completed', 'shortlisted', 'published'], true);
                    $statusColor = match ($draft->status) {
                        'published' => 'success',
                        'ready', 'completed', 'shortlisted' => 'info',
                        'generating', 'queued' => 'warning',
                        'failed' => 'danger',
                        default => 'gray',
                    };
                    $statusLabel = ucfirst(str_replace('_', ' ', (string) $draft->status));
                @endphp

                <div class="flex items-center gap-4 bg-white px-4 py-3 dark:bg-white/5">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-gray-950 dark:text-white truncate">
                                {{ $draft->template_key ?: 'Untitled template' }}
                            </span>
                            <span @class([
                                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                                'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400' => $statusColor === 'success',
                                'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400' => $statusColor === 'info',
                                'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' => $statusColor === 'warning',
                                'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-400' => $statusColor === 'danger',
                                'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' => $statusColor === 'gray',
                            ])>
                                {{ $statusLabel }}
                            </span>
                        </div>
                        <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Variant #{{ $draft->version_number ?? '—' }}
                            · {{ $draft->audience?->value ?? 'default' }}
                            · {{ $draft->created_at?->diffForHumans() }}
                        </div>
                        @if ($draft->error_message)
                            <p class="mt-1 text-xs text-rose-600 dark:text-rose-400 line-clamp-2">
                                {{ $draft->error_message }}
                            </p>
                        @endif
                    </div>

                    <div class="flex shrink-0 items-center gap-2">
                        @if ($previewUrl)
                            <a
                                href="{{ $previewUrl }}"
                                target="_blank"
                                rel="noopener"
                                class="fi-btn fi-btn-size-sm inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                            >
                                Preview
                            </a>
                        @endif

                        @if ($isDone && ! $isPublished)
                            <button
                                type="button"
                                wire:click="publishDraft('{{ $draft->id }}')"
                                wire:confirm="Publish this variant as the live landing page?"
                                class="fi-btn fi-btn-size-sm inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                                Publish
                            </button>
                        @endif

                        <a
                            href="{{ $editUrl }}"
                            class="fi-btn fi-btn-size-sm inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                        >
                            Edit
                        </a>

                        <button
                            type="button"
                            wire:click="deleteDraft('{{ $draft->id }}')"
                            wire:confirm="Delete this draft? This cannot be undone."
                            class="fi-btn fi-btn-size-sm inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-400/30 dark:bg-white/5 dark:text-rose-400 dark:hover:bg-rose-400/10"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>
