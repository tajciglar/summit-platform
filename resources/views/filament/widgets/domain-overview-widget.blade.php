<x-filament-widgets::widget>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        @foreach ($this->getDomains() as $domain)
            <x-filament::section>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-950 dark:text-white">
                            {{ $domain->host }}
                        </h3>
                        @if ($domain->is_active)
                            <x-filament::badge color="success">Active</x-filament::badge>
                        @else
                            <x-filament::badge color="gray">Inactive</x-filament::badge>
                        @endif
                    </div>

                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ $domain->funnels_count }} {{ Str::plural('funnel', $domain->funnels_count) }}
                        &middot;
                        {{ $domain->active_funnels_count }} active
                        @if ($domain->funnels_count - $domain->active_funnels_count > 0)
                            , {{ $domain->funnels_count - $domain->active_funnels_count }} draft
                        @endif
                    </p>

                    <div class="mt-2">
                        <x-filament::button
                            :href="\App\Filament\Resources\Domains\DomainResource::getUrl('edit', ['record' => $domain])"
                            tag="a"
                            size="sm"
                        >
                            Manage
                        </x-filament::button>
                    </div>
                </div>
            </x-filament::section>
        @endforeach

        <x-filament::section>
            <div class="flex items-center justify-center min-h-[100px]">
                <x-filament::button
                    :href="\App\Filament\Resources\Domains\DomainResource::getUrl('create')"
                    tag="a"
                    color="gray"
                    icon="heroicon-o-plus"
                >
                    Add new domain
                </x-filament::button>
            </div>
        </x-filament::section>
    </div>
</x-filament-widgets::widget>
