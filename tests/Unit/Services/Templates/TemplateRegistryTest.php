<?php

use App\Services\Templates\TemplateRegistry;

beforeEach(function () {
    $this->tmp = tempnam(sys_get_temp_dir(), 'manifest');
    file_put_contents($this->tmp, json_encode([
        'templates' => [
            [
                'key' => 'opus-v1',
                'label' => 'Editorial',
                'thumbnail' => '/template-thumbs/opus-v1.jpg',
                'tags' => ['editorial'],
                'jsonSchema' => ['type' => 'object', 'properties' => ['x' => ['type' => 'string']]],
            ],
        ],
    ]));
});

afterEach(fn () => @unlink($this->tmp));

it('lists all template keys', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->allKeys())->toEqual(['opus-v1']);
});

it('returns a template definition by key', function () {
    $registry = new TemplateRegistry($this->tmp);
    $t = $registry->get('opus-v1');
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
    expect($registry->exists('opus-v1'))->toBeTrue();
    expect($registry->exists('missing'))->toBeFalse();
});

it('throws when manifest file is not valid JSON', function () {
    $bad = tempnam(sys_get_temp_dir(), 'bad');
    file_put_contents($bad, '{invalid json');
    expect(fn () => new TemplateRegistry($bad))->toThrow(RuntimeException::class);
    @unlink($bad);
});

it('returns false and empty arrays for templates without section metadata', function () {
    // Use the synthetic beforeEach manifest — opus-v1 has no section metadata there.
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->supportsSections('opus-v1'))->toBeFalse();
    expect($registry->supportedSections('opus-v1'))->toBe([]);
    expect($registry->sectionOrder('opus-v1'))->toBe([]);
    expect($registry->defaultEnabledSections('opus-v1'))->toBe([]);
    expect($registry->sectionSchemas('opus-v1'))->toBe([]);
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

it('returns section metadata for opus-v1 in the real manifest', function () {
    $reg = new TemplateRegistry(base_path('next-app/public/template-manifest.json'));
    expect($reg->supportsSections('opus-v1'))->toBeTrue();
    expect($reg->supportedSections('opus-v1'))
        ->toBeArray()
        ->toContain('hero')
        ->toContain('footer')
        ->toContain('faq');
    expect($reg->supportedSections('opus-v1'))->toHaveCount(17);
    expect($reg->defaultEnabledSections('opus-v1'))
        ->toContain('hero')
        ->toContain('footer');
    expect($reg->defaultEnabledSections('opus-v1'))->toHaveCount(10);
    expect($reg->sectionOrder('opus-v1'))->toHaveCount(17);
    expect($reg->sectionSchemas('opus-v1'))->toHaveKey('hero');
    expect($reg->sectionSchemas('opus-v1')['hero'])->toHaveKey('type');
});

it('returns false and empty arrays for templates without section metadata in the real manifest', function () {
    $reg = new TemplateRegistry(base_path('next-app/public/template-manifest.json'));
    expect($reg->supportsSections('opus-v2'))->toBeFalse();
    expect($reg->supportedSections('opus-v2'))->toBe([]);
    expect($reg->sectionOrder('opus-v2'))->toBe([]);
    expect($reg->defaultEnabledSections('opus-v2'))->toBe([]);
    expect($reg->sectionSchemas('opus-v2'))->toBe([]);
});
