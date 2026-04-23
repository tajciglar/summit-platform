@php
    /** @var \App\Models\FunnelStep $step */
    $step = $getRecord();
    $nextBase = rtrim((string) config('next.url', 'http://localhost:3000'), '/');
    $previewUrl = (is_array($step?->page_content) && isset($step->page_content['template_key']))
        ? "{$nextBase}/preview/step/{$step->id}"
        : null;
@endphp

@if ($previewUrl)
    <div
        class="rounded-lg border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900"
        style="position: sticky; top: 80px;"
        x-data="{
            previewKey: 0,
            debounceTimer: null,
            iframeReady: false,
            pushToPreview() {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(async () => {
                    const result = await $wire.getPreviewContent();
                    const iframe = this.$refs.previewFrame;
                    if (iframe?.contentWindow && result?.content) {
                        iframe.contentWindow.postMessage({
                            type: 'step-preview-update',
                            content: result.content,
                            enabled_sections: result.enabled_sections ?? null,
                            tokens: result.tokens ?? null,
                            sections: result.sections ?? null,
                        }, '*');
                    }
                }, 600);
            },
        }"
        x-on:step-saved.window="previewKey++"
        x-on:form-updated.window="pushToPreview()"
        x-init="
            window.addEventListener('message', (e) => {
                if (e.data?.type !== 'inline-edit') return;
                if (typeof e.data.path !== 'string') return;
                $wire.call('updateContentPath', e.data.path, e.data.value ?? '');
            });
        "
    >
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-white/10">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Live preview</span>
            <button
                type="button"
                x-on:click="previewKey++"
                class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
                title="Refresh preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                    <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.466l.312.311H11.768a.75.75 0 0 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V3.535a.75.75 0 0 0-1.5 0v2.033l-.312-.311A7 7 0 0 0 2.618 8.395a.75.75 0 0 0 1.449.39Z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <iframe
            x-ref="previewFrame"
            :src="'{{ $previewUrl }}' + '?inline=1&v=' + previewKey"
            class="w-full"
            style="height: calc(100vh - 120px);"
            frameborder="0"
        ></iframe>
    </div>
@else
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 text-sm text-gray-400 dark:border-white/10 dark:bg-white/5">
        Preview available after saving with a template
    </div>
@endif
