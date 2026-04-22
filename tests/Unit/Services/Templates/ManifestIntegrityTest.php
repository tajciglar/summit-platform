<?php

declare(strict_types=1);

beforeEach(function () {
    $this->manifestFile = base_path('next-app/public/template-manifest.json');
    expect(is_file($this->manifestFile))->toBeTrue();
    $this->manifest = json_decode(file_get_contents($this->manifestFile), true);
    expect($this->manifest)->toBeArray();
});

it('template manifest covers every key from next-app registry', function () {
    $registryFile = base_path('next-app/src/templates/registry.metadata.ts');
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

it('every core landing section in the catalog is supported by every catalog-backed template', function () {
    // Core sections are scoped per pageType; this test covers landing templates
    // that participate in the shared catalog (those that emit `sectionSchemas`).
    // Monolithic templates (e.g. indigo-gold) advertise template-private section
    // keys for the enable/disable toggle and are intentionally excluded.
    $coreKeys = collect($this->manifest['catalog'] ?? [])
        ->filter(fn ($v) => ($v['tier'] ?? null) === 'core' && in_array('landing', $v['pageTypes'] ?? [], true))
        ->keys()
        ->all();

    $catalogBacked = collect($this->manifest['templates'] ?? [])
        ->filter(fn ($t) => ! empty($t['sectionSchemas']));

    foreach ($catalogBacked as $t) {
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

it('every catalog-backed section of a catalog-backed template exists in the catalog', function () {
    // Monolithic templates (those without `sectionSchemas`) use template-private
    // section keys for toggling and are exempt from catalog-key alignment.
    //
    // Catalog-backed templates may also declare template-private sections in
    // `supportedSections` — typically sales-page specific sections that don't
    // belong in the shared landing catalog. We treat any key that is NOT in
    // `sectionSchemas` as template-private and exempt it from this check.
    $catalogKeys = array_keys($this->manifest['catalog'] ?? []);
    foreach ($this->manifest['templates'] ?? [] as $t) {
        if (empty($t['sectionSchemas'])) {
            continue;
        }
        $catalogBackedKeys = array_keys($t['sectionSchemas']);
        foreach ($catalogBackedKeys as $ss) {
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
