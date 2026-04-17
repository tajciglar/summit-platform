<x-filament-panels::page>
    <div wire:poll.{{ $this->getPollingInterval() ?? '0s' }}>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach($this->drafts as $draft)
                @php
                    $template = $this->registry->exists($draft->template_key)
                        ? $this->registry->get($draft->template_key)
                        : null;
                    $nextUrl = env('LARAVEL_NEXT_URL', 'http://localhost:3000');
                @endphp
                <div class="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    @if($template && $draft->status === 'ready')
                        <img src="{{ $nextUrl }}{{ $template['thumbnail'] }}"
                             alt="{{ $template['label'] }}"
                             class="w-full h-48 object-cover" />
                    @else
                        <div class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                            @if(in_array($draft->status, ['queued', 'generating']))
                                <span>Generating…</span>
                            @elseif($draft->status === 'failed')
                                <span class="text-rose-600">Failed</span>
                            @endif
                        </div>
                    @endif

                    <div class="p-4">
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold">{{ $template['label'] ?? $draft->template_key }}</h3>
                            <span class="text-xs uppercase tracking-wider
                                @switch($draft->status)
                                    @case('ready') text-sky-600 @break
                                    @case('shortlisted') text-emerald-600 @break
                                    @case('published') text-indigo-600 @break
                                    @case('failed') text-rose-600 @break
                                    @default text-gray-500
                                @endswitch">
                                {{ $draft->status }}
                            </span>
                        </div>

                        @if($draft->status === 'failed' && $draft->error_message)
                            <p class="mt-2 text-sm text-rose-600">{{ $draft->error_message }}</p>
                        @endif

                        <div class="mt-4 flex gap-2 flex-wrap">
                            @if(in_array($draft->status, ['ready', 'shortlisted']))
                                <a href="{{ $nextUrl }}/preview/{{ $draft->preview_token }}"
                                   target="_blank"
                                   class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">Preview</a>

                                <a href="{{ \App\Filament\Resources\Funnels\FunnelResource::getUrl('edit-landing-page-draft', ['record' => $this->funnel->id, 'draft' => $draft->id]) }}"
                                   class="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded">Edit</a>

                                @if($draft->status === 'ready')
                                    <button wire:click="approve('{{ $draft->id }}')"
                                            class="px-3 py-1 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded">Approve</button>
                                @endif

                                <button wire:click="publish('{{ $draft->id }}')"
                                        wire:confirm="This will replace the currently live landing page. Continue?"
                                        class="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded">Publish</button>

                                <button wire:click="reject('{{ $draft->id }}')"
                                        wire:confirm="Hide this draft?"
                                        class="px-3 py-1 text-sm bg-rose-100 hover:bg-rose-200 text-rose-800 rounded">Reject</button>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach

            @if($this->drafts->isEmpty())
                <div class="col-span-3 text-center py-16 text-gray-500">
                    No drafts yet. Click "Generate Landing Pages" on the funnel to create some.
                </div>
            @endif
        </div>
    </div>
</x-filament-panels::page>
