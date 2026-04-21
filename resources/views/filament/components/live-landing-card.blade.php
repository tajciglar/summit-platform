@php
    /** @var \App\Models\FunnelStep $step */
    $step = $getRecord();
    $funnel = $step?->funnel;
    $draft = $funnel?->publishedDraft()->first();
    $previewBase = rtrim((string) config('next.url', 'http://localhost:3000'), '/');
    $registry = app(\App\Services\Templates\TemplateRegistry::class);
@endphp

@if ($draft)
    @php
        $label = $registry->get($draft->template_key)['label'] ?? $draft->template_key;
        $palette = array_slice(array_values((array) ($draft->palette ?? [])), 0, 5);
        $previewUrl = $draft->preview_token ? "{$previewBase}/preview/{$draft->preview_token}" : null;
        $driveTabUrl = \App\Filament\Resources\Funnels\FunnelResource::getUrl('view', ['record' => $funnel->id]);
    @endphp

    <div style="display:flex;gap:20px;align-items:center;justify-content:space-between;padding:20px;border:1px solid #e9d5ff;border-radius:12px;background:linear-gradient(135deg,#faf5ff 0%,#ffffff 60%)">
        <div style="display:flex;align-items:center;gap:16px;min-width:0">
            <div style="width:140px;height:88px;border-radius:8px;background:linear-gradient(135deg,#0f172a,#475569);flex-shrink:0;box-shadow:0 2px 8px rgba(15,23,42,.15)"></div>
            <div style="display:flex;flex-direction:column;gap:6px;min-width:0">
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#64748b">
                    <span style="width:8px;height:8px;background:#22c55e;border-radius:50%;box-shadow:0 0 0 4px #dcfce7"></span>
                    <span>Published {{ $draft->updated_at?->diffForHumans() }}</span>
                </div>
                <div style="font-size:18px;font-weight:700;color:#0f172a">{{ $label }} · v{{ $draft->version_number }}</div>
                <div style="font-size:11px;color:#94a3b8;font-family:monospace">{{ $draft->template_key }}</div>
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#64748b;flex-wrap:wrap">
                    <span>audience: {{ $draft->audience?->label() ?? '—' }}</span>
                    <span style="color:#cbd5e1">·</span>
                    <span>palette:</span>
                    <span style="display:inline-flex;gap:2px">
                        @foreach ($palette as $swatch)
                            <span style="width:14px;height:14px;border-radius:3px;border:1px solid rgba(0,0,0,.08);background:{{ $swatch }}"></span>
                        @endforeach
                    </span>
                </div>
            </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
            @if ($previewUrl)
                <a href="{{ $previewUrl }}" target="_blank" rel="noopener"
                   style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#334155;font-size:13px;font-weight:500;text-align:center;text-decoration:none">Preview</a>
            @endif
            <a href="{{ $driveTabUrl }}"
               style="padding:6px 12px;border:1px solid #7c3aed;border-radius:8px;background:#7c3aed;color:#fff;font-size:13px;font-weight:600;text-align:center;text-decoration:none">Go to Drafts</a>
        </div>
    </div>
@else
    @php
        $driveTabUrl = $funnel ? \App\Filament\Resources\Funnels\FunnelResource::getUrl('view', ['record' => $funnel->id]) : '#';
    @endphp
    <div style="padding:32px;border:1px dashed #cbd5e1;border-radius:12px;background:repeating-linear-gradient(45deg,#fafafa 0 6px,#f4f4f5 6px 12px);text-align:center">
        <h4 style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0f172a">No live landing page yet</h4>
        <p style="margin:0 0 16px;font-size:13px;color:#64748b">Publish a draft from the Drafts tab to go live.</p>
        @if ($funnel)
            <a href="{{ $driveTabUrl }}"
               style="display:inline-block;padding:8px 16px;background:#7c3aed;color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Go to Drafts</a>
        @endif
    </div>
@endif
