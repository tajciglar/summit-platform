<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    @php
        $itemId = $getState();
        $item = $itemId ? \App\Models\MediaItem::find($itemId) : null;
        $options = \App\Models\MediaItem::query()
            ->when(\Filament\Facades\Filament::getTenant(), fn ($q, $tenant) => $q->visibleTo($tenant))
            ->where('category', $getCategory())
            ->when($getSubCategoryFilter(), fn ($q, $sub) => $q->where('sub_category', $sub))
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->mapWithKeys(fn ($i) => [$i->id => ($i->caption ?: $i->id).' ('.($i->sub_category ?: 'uncategorized').')'])
            ->all();
    @endphp

    <div class="flex gap-4 items-start">
        <div class="w-32 h-32 border border-dashed rounded overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            @if ($item?->thumbUrl())
                <img src="{{ $item->thumbUrl() }}" alt="{{ $item->alt_text }}" class="object-contain w-full h-full">
            @else
                <span class="text-xs text-gray-400 text-center px-2">No image</span>
            @endif
        </div>

        <div class="flex-1">
            <select
                wire:model.live="data.{{ $getStatePath(false) }}"
                class="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
                <option value="">— Select from library —</option>
                @foreach ($options as $id => $label)
                    <option value="{{ $id }}" @selected($itemId === $id)>{{ $label }}</option>
                @endforeach
            </select>
            <p class="mt-1 text-xs text-gray-500">
                Don't see it? Upload to the media library first, then return here.
            </p>
        </div>
    </div>
</x-dynamic-component>
