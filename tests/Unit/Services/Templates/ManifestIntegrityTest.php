<?php

declare(strict_types=1);

beforeEach(function () {
    $this->manifestFile = base_path('next-app/public/template-manifest.json');
    expect(is_file($this->manifestFile))->toBeTrue();
    $this->manifest = json_decode(file_get_contents($this->manifestFile), true);
    expect($this->manifest)->toBeArray();
});

it('template manifest covers every key from next-app registry', function () {
    $registryFile = base_path('next-app/src/templates/registry.ts');
    expect(is_file($registryFile))->toBeTrue();

    $registrySource = file_get_contents($registryFile);
    preg_match_all("/key:\s*'([a-z0-9-]+)'/", $registrySource, $matches);
    $registryKeys = array_values(array_unique($matches[1]));
    sort($registryKeys);

    $manifestKeys = collect($this->manifest['templates'] ?? [])
        ->pluck('key')
        ->sort()
        ->values()
        ->all();

    expect($manifestKeys)->toEqualCanonicalizing($registryKeys);
});

it('every core section in the catalog is supported by every section-aware template', function () {
    $coreKeys = collect($this->manifest['catalog'] ?? [])
        ->filter(fn ($v) => ($v['tier'] ?? null) === 'core')
        ->keys()
        ->all();

    $sectionAware = collect($this->manifest['templates'] ?? [])
        ->filter(fn ($t) => ! empty($t['supportedSections']));

    foreach ($sectionAware as $t) {
        foreach ($coreKeys as $ck) {
            expect($t['supportedSections'], "{$t['key']} missing core section {$ck}")
                ->toContain($ck);
        }
    }
});

it('defaultEnabledSections is a subset of supportedSections for every section-aware template', function () {
    foreach ($this->manifest['templates'] ?? [] as $t) {
        if (empty($t['supportedSections'])) {
            continue;
        }
        $supported = $t['supportedSections'];
        $default = $t['defaultEnabledSections'] ?? [];
        foreach ($default as $d) {
            expect($supported)->toContain($d);
        }
    }
});

it('every supportedSection key exists in the catalog', function () {
    $catalogKeys = array_keys($this->manifest['catalog'] ?? []);
    foreach ($this->manifest['templates'] ?? [] as $t) {
        foreach ($t['supportedSections'] ?? [] as $ss) {
            expect($catalogKeys)->toContain($ss);
        }
    }
});

it('sectionOrder is a permutation of supportedSections for every section-aware template', function () {
    foreach ($this->manifest['templates'] ?? [] as $t) {
        if (empty($t['supportedSections'])) {
            continue;
        }
        $supported = $t['supportedSections'];
        $order = $t['sectionOrder'] ?? [];
        sort($supported);
        sort($order);
        expect($order)->toBe($supported);
    }
});
