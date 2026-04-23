<?php

use App\Http\Resources\SectionResource;

it('passes through a well-formed section', function () {
    $section = [
        'id' => 's-1',
        'type' => 'hero',
        'jsx' => '<div>hi</div>',
        'fields' => [['path' => 'title', 'kind' => 'text', 'value' => 'Hello']],
        'css' => '.x{}',
        'status' => 'ready',
        'regeneration_note' => null,
        'source_section_id' => null,
    ];

    $result = (new SectionResource($section))->toArray(request());

    expect($result)->toBe($section);
});

it('fills defaults for a malformed section', function () {
    $result = (new SectionResource(['type' => 'hero', 'jsx' => '<div/>']))->toArray(request());

    expect($result['id'])->toBe('');
    expect($result['type'])->toBe('hero');
    expect($result['jsx'])->toBe('<div/>');
    expect($result['fields'])->toBe([]);
    expect($result['css'])->toBeNull();
    expect($result['status'])->toBe('ready');
    expect($result['regeneration_note'])->toBeNull();
    expect($result['source_section_id'])->toBeNull();
});

it('rejects non-whitelisted status values and falls back to ready', function () {
    $result = (new SectionResource(['type' => 'x', 'status' => 'evil-injected']))->toArray(request());

    expect($result['status'])->toBe('ready');
});

it('returns unknown type when type is missing', function () {
    $result = (new SectionResource([]))->toArray(request());

    expect($result['type'])->toBe('unknown');
});
