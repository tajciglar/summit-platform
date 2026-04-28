<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    @php
        $itemId = $getState();
        $item = $itemId ? \App\Models\MediaItem::find($itemId) : null;
        $statePath = $getStatePath(false);
        $uploadPath = $getUploadStatePath(false);
        $options = \App\Models\MediaItem::query()
            ->where('category', $getCategory())
            ->when($getSubCategoryFilter(), fn ($q, $sub) => $q->where('sub_category', $sub))
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->mapWithKeys(fn ($i) => [$i->id => ($i->caption ?: $i->file_name ?: $i->id).' ('.($i->sub_category ?: 'uncategorized').')'])
            ->all();
        $uploadFile = data_get($this, 'data.'.$uploadPath);
        $uploadFile = is_array($uploadFile) ? ($uploadFile[0] ?? null) : $uploadFile;
        $previewUrl = null;
        if ($uploadFile instanceof \Livewire\Features\SupportFileUploads\TemporaryUploadedFile) {
            try {
                $previewUrl = $uploadFile->temporaryUrl();
            } catch (\Throwable) {
                $previewUrl = null;
            }
        }
        // Prefer the thumbnail, but fall back to the full-size URL — the thumb
        // conversion runs in the queue and is not always ready immediately
        // after a fresh upload.
        $previewUrl = $previewUrl ?: $item?->thumbUrl() ?: $item?->url();
        $hasAnything = $previewUrl !== null;
    @endphp

    <div class="flex gap-4 items-start">
        <div class="relative w-32 h-32 border border-dashed border-gray-300 dark:border-gray-700 rounded overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900 shrink-0">
            @if ($previewUrl)
                <img src="{{ $previewUrl }}" alt="{{ $item?->alt_text ?? '' }}" class="object-contain w-full h-full">
            @else
                <span class="text-xs text-gray-400 text-center px-2">No image</span>
            @endif

            @if ($hasAnything)
                <button
                    type="button"
                    wire:click="$set('data.{{ $statePath }}', null); $set('data.{{ $uploadPath }}', null)"
                    title="Remove image"
                    aria-label="Remove image"
                    class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-900/70 text-white text-sm hover:bg-red-600 transition"
                >
                    &times;
                </button>
            @endif
        </div>

        <div class="flex-1 space-y-3">
            @if ($isUploadAllowed())
                <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Upload new</label>
                    <input
                        type="file"
                        wire:model="data.{{ $uploadPath }}"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                        class="block w-full text-sm text-gray-600 dark:text-gray-400
                               file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0
                               file:text-sm file:font-medium
                               file:bg-primary-50 file:text-primary-700
                               hover:file:bg-primary-100
                               dark:file:bg-primary-900/20 dark:file:text-primary-300"
                    />
                </div>
            @endif

            <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ $isUploadAllowed() ? 'Or pick from library' : 'Pick from library' }}
                </label>
                <select
                    wire:model.live="data.{{ $statePath }}"
                    class="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                    <option value="">— None —</option>
                    @foreach ($options as $id => $label)
                        <option value="{{ $id }}" @selected($itemId === $id)>{{ $label }}</option>
                    @endforeach
                </select>
            </div>
        </div>
    </div>
</x-dynamic-component>
