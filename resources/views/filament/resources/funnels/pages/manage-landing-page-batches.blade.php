<x-filament-panels::page>
    @php
        $batches = $this->getBatches();
        $runtimeFlag = (bool) config('features.runtime_gemini_gen');

        $batchColor = fn ($status) => match ($status) {
            'completed' => 'success',
            'running'   => 'warning',
            'failed'    => 'danger',
            default     => 'gray',
        };

        $draftColor = fn ($status) => match ($status) {
            'ready'      => 'info',
            'approved'   => 'success',
            'published'  => 'success',
            'publishing' => 'warning',
            'rejected'   => 'danger',
            'generating' => 'warning',
            'failed'     => 'danger',
            default      => 'gray',
        };

        $sectionColor = fn ($status) => match ($status) {
            'ready'        => 'success',
            'regenerating' => 'warning',
            'generating'   => 'warning',
            'failed'       => 'danger',
            default        => 'gray',
        };

        $humanise = fn ($t) => Str::of($t ?? '')->replace('_', ' ')->title();

        // Auto-refresh only while something is in flight — stop polling once
        // every batch is completed/failed and no draft is transient.
        $hasActive = $batches->contains(
            fn ($b) => in_array($b->status, ['queued', 'running'], true)
                || $b->drafts->contains(fn ($d) => in_array(
                    $d->status,
                    ['pending', 'generating', 'regenerating', 'publishing'],
                    true,
                )),
        );
    @endphp

    @if ($hasActive)
        <div wire:poll.5000ms></div>
    @endif

    @if ($batches->isEmpty())
        <x-filament::section>
            <div class="text-center py-12">
                <x-heroicon-o-sparkles class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
                <p class="text-lg font-medium text-gray-900 dark:text-white">No landing pages generated yet.</p>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Click "Generate Landing Pages" above to create your first batch.
                </p>
            </div>
        </x-filament::section>
    @else
        <div class="space-y-6">
            @foreach ($batches as $batch)
                <x-filament::section>
                    <x-slot name="heading">
                        <div class="flex items-center gap-3">
                            <span>Batch · {{ $batch->created_at->format('M j, Y H:i') }}</span>
                            <x-filament::badge :color="$batchColor($batch->status)">
                                {{ ucfirst($batch->status) }}
                            </x-filament::badge>
                        </div>
                    </x-slot>

                    <x-slot name="description">
                        {{ $batch->version_count }} version(s) · funnel: {{ $batch->funnel?->name ?? '—' }}
                        @if ($batch->notes)
                            · <span class="italic">{{ Str::limit($batch->notes, 80) }}</span>
                        @endif
                    </x-slot>

                    @if ($batch->drafts->isEmpty())
                        <p class="text-sm text-gray-500 dark:text-gray-400">Drafts queuing…</p>
                    @else
                        <div class="space-y-4">
                            @foreach ($batch->drafts as $draft)
                                @php
                                    $sections = $draft->sections ?? [];
                                    $hasSections = ! empty($sections);
                                    $usesNewFlow = $runtimeFlag && $hasSections;
                                    $allReady = $hasSections && collect($sections)->every(fn ($s) => ($s['status'] ?? null) === 'ready');
                                    $canDelete = in_array($batch->status, ['running', 'completed'], true)
                                                 && ! in_array($draft->status, ['generating', 'publishing'], true);
                                    $previewUrl = rtrim(config('next.url'), '/') . '/preview/' . $draft->preview_token;
                                    $canPreview = in_array($draft->status, ['ready', 'approved', 'publishing', 'published'], true);
                                @endphp

                                <div
                                    class="fi-section fi-section-has-header rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900"
                                    wire:key="draft-{{ $draft->id }}"
                                >
                                    {{-- Draft header --}}
                                    <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-white/10">
                                        <div class="flex items-center gap-3 flex-wrap">
                                            <span class="text-base font-semibold text-gray-900 dark:text-white">
                                                Version {{ $draft->version_number }}
                                            </span>
                                            <x-filament::badge :color="$draftColor($draft->status)">
                                                {{ ucfirst($draft->status) }}
                                            </x-filament::badge>

                                            @if ($hasSections)
                                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                                    {{ count($sections) }} section(s)
                                                </span>
                                            @endif
                                        </div>

                                        @if ($canDelete)
                                            <x-filament::icon-button
                                                icon="heroicon-o-x-mark"
                                                color="gray"
                                                size="sm"
                                                label="Delete version {{ $draft->version_number }}"
                                                wire:click="deleteDraft('{{ $draft->id }}')"
                                                wire:confirm="Delete Version {{ $draft->version_number }} permanently? This cannot be undone."
                                            />
                                        @endif
                                    </div>

                                    @if ($draft->status === 'failed' && $draft->error_message)
                                        <div class="px-6 py-3 border-b border-gray-200 dark:border-white/10">
                                            <p class="text-sm text-danger-600 dark:text-danger-400">
                                                {{ $draft->error_message }}
                                            </p>
                                        </div>
                                    @endif

                                    {{-- Action row --}}
                                    <div class="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-white/10">
                                        @if ($canPreview)
                                            <x-filament::button
                                                tag="a"
                                                :href="$previewUrl"
                                                target="_blank"
                                                color="gray"
                                                size="sm"
                                                icon="heroicon-o-arrow-top-right-on-square"
                                            >
                                                Preview
                                            </x-filament::button>
                                        @endif

                                        @if ($draft->status === 'ready' && $batch->status === 'running')
                                            @if ($usesNewFlow)
                                                <x-filament::button
                                                    color="success"
                                                    size="sm"
                                                    icon="heroicon-o-check"
                                                    :disabled="! $allReady"
                                                    wire:click="publishDraft('{{ $draft->id }}')"
                                                    wire:confirm="Publish Version {{ $draft->version_number }}? This will render the page and push it live."
                                                    :tooltip="$allReady ? null : 'All sections must be in the ready state before publishing.'"
                                                >
                                                    Publish
                                                </x-filament::button>

                                                <x-filament::button
                                                    color="warning"
                                                    size="sm"
                                                    icon="heroicon-o-arrow-path"
                                                    wire:click="regenerateAllSections('{{ $draft->id }}')"
                                                    wire:confirm="This will re-run every section. Continue?"
                                                >
                                                    Regenerate all
                                                </x-filament::button>
                                            @else
                                                <x-filament::button
                                                    color="success"
                                                    size="sm"
                                                    icon="heroicon-o-check"
                                                    wire:click="approveDraft('{{ $draft->id }}')"
                                                    wire:confirm="Approve Version {{ $draft->version_number }}? This will overwrite the current optin step blocks."
                                                >
                                                    Approve
                                                </x-filament::button>
                                            @endif

                                            <x-filament::button
                                                color="danger"
                                                size="sm"
                                                icon="heroicon-o-x-mark"
                                                wire:click="rejectDraft('{{ $draft->id }}')"
                                                wire:confirm="Reject Version {{ $draft->version_number }}?"
                                            >
                                                Reject
                                            </x-filament::button>
                                        @endif
                                    </div>

                                    {{-- Sections list --}}
                                    @if ($hasSections)
                                        <div class="px-6 py-4 space-y-2">
                                            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Sections
                                            </p>

                                            @foreach ($sections as $index => $section)
                                                @php
                                                    $sectionId = $section['id'] ?? null;
                                                    $fields = $section['fields'] ?? [];
                                                @endphp

                                                <div
                                                    class="rounded-lg border border-gray-200 dark:border-white/10"
                                                    x-data="{ open: false }"
                                                    wire:key="section-{{ $draft->id }}-{{ $sectionId }}"
                                                >
                                                    {{-- Section row (clickable to toggle) --}}
                                                    <div class="flex items-center gap-3 px-4 py-3">
                                                        <button
                                                            type="button"
                                                            class="flex items-center gap-2 flex-1 text-left"
                                                            @click="open = ! open"
                                                        >
                                                            <x-heroicon-o-chevron-right
                                                                class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform"
                                                                ::class="{ 'rotate-90': open }"
                                                            />
                                                            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                                                                {{ $index + 1 }}.
                                                            </span>
                                                            <span class="text-sm font-medium text-gray-900 dark:text-white">
                                                                {{ $humanise($section['type'] ?? 'unknown') }}
                                                            </span>
                                                        </button>

                                                        <x-filament::badge :color="$sectionColor($section['status'] ?? '')" size="xs">
                                                            {{ $section['status'] ?? 'unknown' }}
                                                        </x-filament::badge>

                                                        <x-filament::icon-button
                                                            icon="heroicon-o-arrow-path"
                                                            color="gray"
                                                            size="sm"
                                                            label="Regenerate this section"
                                                            tooltip="Regenerate this section"
                                                            wire:click="regenerateSection('{{ $draft->id }}', '{{ $sectionId }}')"
                                                            wire:loading.attr="disabled"
                                                            wire:target="regenerateSection('{{ $draft->id }}', '{{ $sectionId }}')"
                                                            :disabled="($section['status'] ?? null) === 'regenerating'"
                                                        />
                                                    </div>

                                                    @if (($section['status'] ?? '') === 'failed' && ! empty($section['error']))
                                                        <div class="px-4 pb-3">
                                                            <p class="text-xs text-danger-600 dark:text-danger-400">
                                                                {{ $section['error'] }}
                                                            </p>
                                                        </div>
                                                    @endif

                                                    {{-- Expanded editor --}}
                                                    <div
                                                        x-show="open"
                                                        x-cloak
                                                        x-collapse
                                                        class="border-t border-gray-200 dark:border-white/10"
                                                    >
                                                        <div class="px-4 py-4 space-y-5">
                                                            {{-- Fields --}}
                                                            @if (! empty($fields))
                                                                <div class="space-y-3">
                                                                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                        Content fields
                                                                    </p>

                                                                    @foreach ($fields as $fieldIndex => $field)
                                                                        @php
                                                                            $fieldType = $field['type'] ?? 'text';
                                                                            $fieldValue = $field['value'] ?? '';
                                                                            $fieldLabel = $field['label'] ?? $field['path'] ?? 'Field';
                                                                            $inputId = 'field-' . $draft->id . '-' . $sectionId . '-' . $fieldIndex;
                                                                            $saveCall = "updateSectionField('{$draft->id}', '{$sectionId}', {$fieldIndex}, \$event.target.value)";
                                                                        @endphp

                                                                        <div>
                                                                            <label for="{{ $inputId }}" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                {{ $fieldLabel }}
                                                                                <span class="text-gray-400 font-normal">({{ $fieldType }})</span>
                                                                            </label>

                                                                            @if ($fieldType === 'textarea')
                                                                                <x-filament::input.wrapper>
                                                                                    <textarea
                                                                                        id="{{ $inputId }}"
                                                                                        rows="3"
                                                                                        class="fi-input block w-full border-none bg-transparent px-3 py-1.5 text-base text-gray-950 outline-none transition duration-75 placeholder:text-gray-400 focus:ring-0 disabled:text-gray-500 disabled:[-webkit-text-fill-color:theme(colors.gray.500)] disabled:placeholder:[-webkit-text-fill-color:theme(colors.gray.400)] dark:text-white dark:placeholder:text-gray-500 dark:disabled:text-gray-400 dark:disabled:[-webkit-text-fill-color:theme(colors.gray.400)] dark:disabled:placeholder:[-webkit-text-fill-color:theme(colors.gray.500)] sm:text-sm sm:leading-6"
                                                                                        wire:change="{{ $saveCall }}"
                                                                                    >{{ $fieldValue }}</textarea>
                                                                                </x-filament::input.wrapper>
                                                                            @else
                                                                                @php
                                                                                    $inputType = match ($fieldType) {
                                                                                        'url', 'image' => 'url',
                                                                                        default => 'text',
                                                                                    };
                                                                                @endphp
                                                                                <x-filament::input.wrapper>
                                                                                    <x-filament::input
                                                                                        :id="$inputId"
                                                                                        :type="$inputType"
                                                                                        :value="$fieldValue"
                                                                                        wire:change="{{ $saveCall }}"
                                                                                    />
                                                                                </x-filament::input.wrapper>
                                                                            @endif
                                                                        </div>
                                                                    @endforeach

                                                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                                                        Changes save automatically when you click outside the field.
                                                                    </p>
                                                                </div>
                                                            @else
                                                                <p class="text-xs text-gray-500 dark:text-gray-400 italic">
                                                                    No editable fields for this section.
                                                                </p>
                                                            @endif

                                                            {{-- Regenerate with note --}}
                                                            <div
                                                                class="space-y-2"
                                                                x-data="{ note: '' }"
                                                            >
                                                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                    Regenerate with note
                                                                </p>
                                                                <x-filament::input.wrapper>
                                                                    <textarea
                                                                        x-model="note"
                                                                        maxlength="500"
                                                                        rows="2"
                                                                        placeholder="E.g. 'Make the headline punchier, emphasise urgency'"
                                                                        class="fi-input block w-full border-none bg-transparent px-3 py-1.5 text-base text-gray-950 outline-none transition duration-75 placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-gray-500 sm:text-sm sm:leading-6"
                                                                    ></textarea>
                                                                </x-filament::input.wrapper>
                                                                <div class="flex items-center justify-between">
                                                                    <span class="text-xs text-gray-400" x-text="`${note.length}/500`"></span>
                                                                    <x-filament::button
                                                                        size="sm"
                                                                        color="warning"
                                                                        icon="heroicon-o-arrow-path"
                                                                        x-on:click="$wire.regenerateSection('{{ $draft->id }}', '{{ $sectionId }}', note); note = ''"
                                                                        x-bind:disabled="note.trim().length === 0"
                                                                    >
                                                                        Regenerate with note
                                                                    </x-filament::button>
                                                                </div>
                                                            </div>

                                                            {{-- Danger zone --}}
                                                            <div class="pt-4 border-t border-gray-200 dark:border-white/10">
                                                                <p class="text-xs font-semibold uppercase tracking-wide text-danger-600 dark:text-danger-400 mb-2">
                                                                    Danger zone
                                                                </p>
                                                                <x-filament::button
                                                                    size="sm"
                                                                    color="danger"
                                                                    outlined
                                                                    icon="heroicon-o-trash"
                                                                    wire:click="deleteSection('{{ $draft->id }}', '{{ $sectionId }}')"
                                                                    wire:confirm="Delete this section? This cannot be undone."
                                                                >
                                                                    Delete section
                                                                </x-filament::button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    @endif
                </x-filament::section>
            @endforeach
        </div>
    @endif
</x-filament-panels::page>
