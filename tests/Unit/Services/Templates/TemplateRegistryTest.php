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
        ->toThrow(\RuntimeException::class);
});

it('throws when key does not exist', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect(fn () => $registry->get('missing'))->toThrow(\InvalidArgumentException::class);
});

it('reports existence of a key via exists()', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->exists('opus-v1'))->toBeTrue();
    expect($registry->exists('missing'))->toBeFalse();
});

it('throws when manifest file is not valid JSON', function () {
    $bad = tempnam(sys_get_temp_dir(), 'bad');
    file_put_contents($bad, '{invalid json');
    expect(fn () => new TemplateRegistry($bad))->toThrow(\RuntimeException::class);
    @unlink($bad);
});
