<x-filament-panels::page>
    <form wire:submit="save">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {{-- LEFT: form --}}
            <div class="space-y-6">
                {{ $this->form }}

                <div class="flex items-center justify-end gap-3">
                    <x-filament::button type="submit">
                        Save changes
                    </x-filament::button>
                </div>
            </div>

            {{-- RIGHT: live preview (sticky on desktop) --}}
            <aside class="lg:sticky lg:top-6 lg:self-start">
                <div class="mb-3 flex items-center justify-between">
                    <div class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Live preview</div>
                    <div class="text-xs text-gray-500">Updates as you type</div>
                </div>
                @include('filament.resources.funnel-step-bumps._preview', [
                    'data' => $this->getPreviewData(),
                ])
                <p class="mt-3 text-xs text-gray-500">
                    This is how the bump will appear on checkout. Customers tick the checkbox to add it to their order.
                </p>
            </aside>
        </div>
    </form>
</x-filament-panels::page>
