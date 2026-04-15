<x-filament-panels::page>
    <form wire:submit.prevent="save" class="space-y-6">
        @if ($record->style_reference_url)
            <x-filament::section>
                <div class="flex items-start gap-4">
                    <div class="flex-1">
                        <h3 class="font-semibold">Reference</h3>
                        <p class="text-sm text-gray-600">Built from <a class="underline" href="{{ $record->style_reference_url }}" target="_blank">{{ $record->style_reference_url }}</a></p>
                        <p class="text-xs text-gray-500 mt-1">Status: {{ $record->style_brief_status }}
                            @if ($record->style_brief_built_at) · built {{ $record->style_brief_built_at->diffForHumans() }} @endif
                        </p>
                    </div>
                    @php
                        $refUrl = \Illuminate\Support\Facades\Storage::disk('public')->exists("style-briefs/{$record->id}/reference.png")
                            ? asset('storage/style-briefs/' . $record->id . '/reference.png')
                            : null;
                    @endphp
                    @if ($refUrl)
                        <a href="{{ $refUrl }}" target="_blank">
                            <img src="{{ $refUrl }}" alt="reference" class="w-64 rounded border border-gray-200" />
                        </a>
                    @endif
                </div>
            </x-filament::section>
        @endif

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <x-filament::section heading="Palette">
                <div class="space-y-2">
                    @foreach (['primary','primary_text','accent','background','surface','text','text_muted','border'] as $key)
                        <div class="flex items-center gap-3">
                            <input type="color" wire:model.live="brief.palette.{{ $key }}" class="h-8 w-12 rounded border border-gray-300" />
                            <span class="text-sm w-28">{{ $key }}</span>
                            <input type="text" wire:model.live="brief.palette.{{ $key }}" class="fi-input flex-1 text-xs border border-gray-300 rounded px-2 py-1" />
                            <label class="flex items-center gap-1 text-xs">
                                <input type="checkbox" wire:model.live="locked" value="palette.{{ $key }}" />
                                lock
                            </label>
                        </div>
                    @endforeach
                </div>
            </x-filament::section>

            <div class="space-y-4">
                <x-filament::section heading="Typography">
                    <label class="block text-sm">Heading font
                        <input wire:model.defer="brief.typography.heading_font" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1" />
                    </label>
                    <label class="block text-sm mt-2">Body font
                        <input wire:model.defer="brief.typography.body_font" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1" />
                    </label>
                    <label class="block text-sm mt-2">Heading weight
                        <input type="number" wire:model.defer="brief.typography.heading_weight" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1" />
                    </label>
                    <label class="block text-sm mt-2">Scale
                        <select wire:model.defer="brief.typography.scale" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="compact">compact</option>
                            <option value="comfortable">comfortable</option>
                            <option value="generous">generous</option>
                        </select>
                    </label>
                </x-filament::section>

                <x-filament::section heading="Components">
                    <label class="block text-sm">Button shape
                        <select wire:model.defer="brief.components.button_shape" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="pill">pill</option>
                            <option value="rounded">rounded</option>
                            <option value="square">square</option>
                        </select>
                    </label>
                    <label class="block text-sm mt-2">Card style
                        <select wire:model.defer="brief.components.card_style" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="flat">flat</option>
                            <option value="elevated">elevated</option>
                            <option value="outlined">outlined</option>
                        </select>
                    </label>
                    <label class="block text-sm mt-2">Card radius
                        <select wire:model.defer="brief.components.card_radius" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="sm">sm</option>
                            <option value="md">md</option>
                            <option value="lg">lg</option>
                            <option value="xl">xl</option>
                        </select>
                    </label>
                </x-filament::section>

                <x-filament::section heading="Layout rhythm & hero pattern">
                    <label class="block text-sm">Section padding
                        <select wire:model.defer="brief.rhythm.section_padding" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="tight">tight</option>
                            <option value="comfortable">comfortable</option>
                            <option value="airy">airy</option>
                        </select>
                    </label>
                    <label class="block text-sm mt-2">Max width (px)
                        <input type="number" wire:model.defer="brief.rhythm.max_width" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1" />
                    </label>
                    <label class="block text-sm mt-2">Density
                        <select wire:model.defer="brief.rhythm.density" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="dense">dense</option>
                            <option value="comfortable">comfortable</option>
                            <option value="airy">airy</option>
                        </select>
                    </label>
                    <label class="block text-sm mt-2">Hero pattern
                        <select wire:model.defer="brief.hero_pattern" class="fi-input w-full border border-gray-300 rounded px-2 py-1 mt-1">
                            <option value="split-image-right">split-image-right</option>
                            <option value="split-image-left">split-image-left</option>
                            <option value="centered">centered</option>
                            <option value="full-bleed-image">full-bleed-image</option>
                            <option value="stacked-copy">stacked-copy</option>
                        </select>
                    </label>
                </x-filament::section>
            </div>
        </div>

        <x-filament::section heading="Live swatches">
            <div class="flex flex-wrap gap-3">
                @foreach ($brief['palette'] ?? [] as $key => $color)
                    <div class="flex flex-col items-center text-xs">
                        <div class="h-12 w-12 rounded border border-gray-200" style="background: {{ $color }}"></div>
                        <span class="mt-1">{{ $key }}</span>
                        <span class="text-gray-500">{{ $color }}</span>
                    </div>
                @endforeach
            </div>
        </x-filament::section>
    </form>
</x-filament-panels::page>
