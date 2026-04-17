@php
    /** @var array $data */
    $headline = $data['headline'] ?? null;
    $description = $data['description'] ?? null;
    $bullets = array_filter(array_map(fn ($b) => is_array($b) ? ($b['text'] ?? null) : $b, $data['bullets'] ?? []));
    $checkboxLabel = $data['checkbox_label'] ?? null;
    $imageUrl = $data['image_url'] ?? null;
    $productName = $data['product_name'] ?? null;
    $priceCents = $data['price_cents'] ?? null;
    $formattedPrice = $priceCents !== null ? '$'.number_format($priceCents / 100, 2) : null;
@endphp

<div class="overflow-hidden rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-4 dark:border-amber-500/40 dark:bg-amber-900/10">
    <div class="mb-3 flex items-start gap-3">
        <input type="checkbox" disabled class="mt-1 h-5 w-5 shrink-0 rounded border-gray-400 text-amber-600 focus:ring-amber-500" />
        <div class="min-w-0 flex-1">
            @if ($checkboxLabel || $headline || $formattedPrice)
                <div class="flex items-baseline gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-gray-950 dark:text-gray-50">
                        {{ $checkboxLabel ?: $headline ?: 'Yes — add this to my order' }}
                    </span>
                    @if ($formattedPrice)
                        <span class="text-sm font-bold text-amber-700 dark:text-amber-400">{{ $formattedPrice }}</span>
                    @endif
                </div>
            @else
                <span class="text-sm italic text-gray-400">Checkbox label will appear here</span>
            @endif
        </div>
    </div>

    <div class="flex gap-4">
        @if ($imageUrl)
            <img src="{{ $imageUrl }}" alt="" class="h-24 w-24 shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/10" />
        @else
            <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300 ring-1 ring-dashed ring-gray-300 dark:bg-white/5 dark:text-gray-600 dark:ring-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8">
                    <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6Zm1.5 0v12c0 .414.336.75.75.75h16.5a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H3.75A.75.75 0 0 0 3 6Zm1.5 1.5h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                </svg>
            </div>
        @endif

        <div class="min-w-0 flex-1 space-y-2">
            @if ($productName)
                <div class="text-xs uppercase tracking-wider text-gray-400">{{ $productName }}</div>
            @endif

            @if ($headline)
                <div class="text-base font-bold leading-tight text-gray-950 dark:text-white">{{ $headline }}</div>
            @else
                <div class="text-base italic text-gray-400">Your headline appears here</div>
            @endif

            @if ($description)
                <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {{ $description }}
                </p>
            @endif

            @if (count($bullets) > 0)
                <ul class="mt-2 space-y-1">
                    @foreach ($bullets as $bullet)
                        <li class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
                            </svg>
                            <span>{{ $bullet }}</span>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>
    </div>
</div>
