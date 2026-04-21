@php
    /** @var \App\Models\FunnelStep $record */
    $record = $this->record;
    $funnel = $record->funnel;
    $currentStep = $record;

    $stepTypeLabels = [
        'optin' => 'Opt-in step',
        'sales_page' => 'Sales page',
        'checkout' => 'Checkout',
        'upsell' => 'Upsell',
        'downsell' => 'Downsell',
        'thank_you' => 'Thank-you page',
    ];

    // Preview URL points at the step itself — reflects live block edits via
    // `funnel_steps.page_content` (no draft publish required). Falls back to
    // null only when the step has never been populated.
    $nextBase = rtrim((string) config('next.url', 'http://localhost:3000'), '/');
    $previewUrl = (is_array($record->page_content) && isset($record->page_content['template_key']))
        ? "{$nextBase}/preview/step/{$record->id}"
        : null;

    $funnelEditUrl = \App\Filament\Resources\Funnels\FunnelResource::getUrl('view', ['record' => $funnel->id]);
    $summit = $funnel->summit;
    $summitUrl = $summit
        ? \App\Filament\Resources\Summits\SummitResource::getUrl('view', ['record' => $summit->id])
        : null;
@endphp

<div
    x-data="{
        saving: false,
        savedAt: null,
        submit() {
            if (this.saving) return;
            document.getElementById('step-editor-form')?.requestSubmit();
        },
        markSaved() {
            this.saving = false;
            this.savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
    }"
    x-on:keydown.window="
        if (($event.metaKey || $event.ctrlKey) && $event.key.toLowerCase() === 's') {
            $event.preventDefault();
            submit();
        }
    "
    x-on:step-saved.window="markSaved()"
>
    <div class="fi-focused-editor flex min-h-screen w-full items-stretch bg-gray-50 dark:bg-gray-950">
        {{-- Left: funnel drawer --}}
        @include('filament.funnels.drawer', ['funnel' => $funnel, 'currentStep' => $currentStep])

        {{-- Right: main editor --}}
        <div class="flex min-w-0 flex-1 flex-col">
            {{-- Sticky header with Save --}}
            <header class="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50/90 px-10 py-4 backdrop-blur dark:border-white/10 dark:bg-gray-950/90">
                <div class="min-w-0">
                    <nav class="mb-1.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        @if ($summitUrl)
                            <a href="{{ $summitUrl }}" class="hover:text-gray-700 dark:hover:text-gray-200">{{ $summit->title }}</a>
                            <span>/</span>
                        @endif
                        <a href="{{ $funnelEditUrl }}" class="hover:text-gray-700 dark:hover:text-gray-200">{{ $funnel->name }}</a>
                        <span>/</span>
                        <span class="text-gray-700 dark:text-gray-200">{{ $record->name }}</span>
                    </nav>
                    <div class="flex items-baseline gap-3">
                        <h1 class="text-2xl font-bold text-gray-950 dark:text-white">{{ $record->name }}</h1>
                        <span class="text-sm text-gray-500 dark:text-gray-400">{{ $stepTypeLabels[$record->step_type] ?? ucwords(str_replace('_', ' ', $record->step_type)) }}</span>
                    </div>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                    <span
                        x-show="savedAt"
                        x-transition.opacity.duration.200ms
                        x-text="'Saved ' + savedAt"
                        class="hidden text-xs text-emerald-600 sm:inline dark:text-emerald-400"
                    ></span>

                    @if ($previewUrl)
                        <a href="{{ $previewUrl }}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
                            </svg>
                            Preview live
                        </a>
                    @endif
                    <x-filament::actions :actions="$this->getCachedHeaderActions()" />

                    <button
                        type="button"
                        x-on:click="submit"
                        x-bind:disabled="saving"
                        class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900"
                    >
                        <span x-show="!saving">Save</span>
                        <span x-show="saving" x-cloak>Saving…</span>
                        <kbd class="ml-1 hidden rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white/90 lg:inline">⌘S</kbd>
                    </button>
                </div>
            </header>

            {{-- Content --}}
            <div class="flex-1 px-10 pt-6 pb-10">
                {{-- Publish status pill (display-only mirror of is_published) --}}
                @php
                    $liveUrl = '/'.$funnel->slug.'/'.$record->slug;
                @endphp
                <div class="mb-5 flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
                    <span @class([
                        'h-2 w-2 shrink-0 rounded-full',
                        'bg-emerald-500' => $record->is_published,
                        'bg-gray-300 dark:bg-gray-600' => ! $record->is_published,
                    ])></span>

                    @if ($record->is_published)
                        <span class="text-gray-700 dark:text-gray-200">Published — live at</span>
                        <span class="font-mono text-[13px] text-gray-900 dark:text-white">{{ $liveUrl }}</span>
                    @else
                        <span class="text-gray-500 dark:text-gray-400">Not published · preview only at</span>
                        <span class="font-mono text-[13px] text-gray-700 dark:text-gray-300">{{ $liveUrl }}</span>
                    @endif
                </div>

                <form
                    id="step-editor-form"
                    wire:submit="save"
                    x-on:submit="saving = true"
                    class="space-y-5"
                >
                    {{ $this->form }}
                </form>
            </div>
        </div>
    </div>

    <x-filament-actions::modals />
</div>
