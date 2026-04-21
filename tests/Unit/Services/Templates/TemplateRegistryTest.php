<?php

use App\Services\Templates\TemplateRegistry;

beforeEach(function () {
    $this->tmp = tempnam(sys_get_temp_dir(), 'manifest');
    file_put_contents($this->tmp, json_encode([
        'templates' => [
            [
                'key' => 'ochre-ink',
                'label' => 'Editorial',
                'thumbnail' => '/template-thumbs/ochre-ink.jpg',
                'tags' => ['editorial'],
                'jsonSchema' => ['type' => 'object', 'properties' => ['x' => ['type' => 'string']]],
            ],
        ],
    ]));
});

afterEach(fn () => @unlink($this->tmp));

it('lists all template keys', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->allKeys())->toEqual(['ochre-ink']);
});

it('returns a template definition by key', function () {
    $registry = new TemplateRegistry($this->tmp);
    $t = $registry->get('ochre-ink');
    expect($t['label'])->toBe('Editorial');
    expect($t['jsonSchema']['type'])->toBe('object');
});

it('throws when manifest file is missing', function () {
    expect(fn () => new TemplateRegistry('/does/not/exist.json'))
        ->toThrow(RuntimeException::class);
});

it('throws when key does not exist', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect(fn () => $registry->get('missing'))->toThrow(InvalidArgumentException::class);
});

it('reports existence of a key via exists()', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->exists('ochre-ink'))->toBeTrue();
    expect($registry->exists('missing'))->toBeFalse();
});

it('throws when manifest file is not valid JSON', function () {
    $bad = tempnam(sys_get_temp_dir(), 'bad');
    file_put_contents($bad, '{invalid json');
    expect(fn () => new TemplateRegistry($bad))->toThrow(RuntimeException::class);
    @unlink($bad);
});

it('returns false and empty arrays for templates without section metadata', function () {
    // Use the synthetic beforeEach manifest — ochre-ink has no section metadata there.
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->supportsSections('ochre-ink'))->toBeFalse();
    expect($registry->supportedSections('ochre-ink'))->toBe([]);
    expect($registry->sectionOrder('ochre-ink'))->toBe([]);
    expect($registry->defaultEnabledSections('ochre-ink'))->toBe([]);
    expect($registry->sectionSchemas('ochre-ink'))->toBe([]);
});

it('exposes section metadata when the manifest provides it', function () {
    $tmp = tempnam(sys_get_temp_dir(), 'manifest');
    file_put_contents($tmp, json_encode([
        'templates' => [
            [
                'key' => 'with-sections',
                'label' => 'With Sections',
                'thumbnail' => '/t.jpg',
                'tags' => [],
                'jsonSchema' => ['type' => 'object'],
                'supportedSections' => ['hero', 'footer'],
                'sectionOrder' => ['hero', 'footer'],
                'defaultEnabledSections' => ['hero'],
                'sectionSchemas' => [
                    'hero' => ['type' => 'object', 'properties' => []],
                    'footer' => ['type' => 'object', 'properties' => []],
                ],
            ],
        ],
    ]));

    $registry = new TemplateRegistry($tmp);

    expect($registry->supportsSections('with-sections'))->toBeTrue();
    expect($registry->supportedSections('with-sections'))->toBe(['hero', 'footer']);
    expect($registry->sectionOrder('with-sections'))->toBe(['hero', 'footer']);
    expect($registry->defaultEnabledSections('with-sections'))->toBe(['hero']);
    expect($registry->sectionSchemas('with-sections'))->toHaveKey('hero');
    expect($registry->sectionSchemas('with-sections')['hero'])->toHaveKey('type');

    @unlink($tmp);
});

it('returns section metadata for ochre-ink in the real manifest', function () {
    $reg = new TemplateRegistry(base_path('next-app/public/template-manifest.json'));
    expect($reg->supportsSections('ochre-ink'))->toBeTrue();
    expect($reg->supportedSections('ochre-ink'))
        ->toBeArray()
        ->toContain('hero')
        ->toContain('footer')
        ->toContain('faq');
    expect($reg->supportedSections('ochre-ink'))->toHaveCount(17);
    expect($reg->defaultEnabledSections('ochre-ink'))
        ->toContain('hero')
        ->toContain('footer');
    expect($reg->defaultEnabledSections('ochre-ink'))->toHaveCount(10);
    expect($reg->sectionOrder('ochre-ink'))->toHaveCount(17);
    expect($reg->sectionSchemas('ochre-ink'))->toHaveKey('hero');
    expect($reg->sectionSchemas('ochre-ink')['hero'])->toHaveKey('type');
});

it('returns false and empty arrays for templates without section metadata in the real manifest', function () {
    $reg = new TemplateRegistry(base_path('next-app/public/template-manifest.json'));
    expect($reg->supportsSections('lime-ink'))->toBeFalse();
    expect($reg->supportedSections('lime-ink'))->toBe([]);
    expect($reg->sectionOrder('lime-ink'))->toBe([]);
    expect($reg->defaultEnabledSections('lime-ink'))->toBe([]);
    expect($reg->sectionSchemas('lime-ink'))->toBe([]);
});
