<?php

use App\Services\Templates\TemplateRegistry;
use App\Services\Templates\TemplateSelector;

it('picks N distinct keys from the pool', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b', 'c', 'd']);

    $selector = new TemplateSelector($registry);
    $picks = $selector->pick(pool: ['a', 'b', 'c', 'd'], count: 3);

    expect($picks)->toHaveCount(3);
    expect(array_unique($picks))->toHaveCount(3);
    foreach ($picks as $p) {
        expect(['a', 'b', 'c', 'd'])->toContain($p);
    }
});

it('returns the entire pool when count == pool size', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    expect($selector->pick(pool: ['a', 'b'], count: 2))->toEqualCanonicalizing(['a', 'b']);
});

it('caps count at pool size', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    $picks = $selector->pick(pool: ['a', 'b'], count: 5);
    expect($picks)->toHaveCount(2);
});

it('defaults to full registry when pool is empty', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b', 'c']);
    $selector = new TemplateSelector($registry);
    expect($selector->pick(pool: [], count: 2))->toHaveCount(2);
});

it('filters pool entries that do not exist in registry', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    $picks = $selector->pick(pool: ['a', 'bogus'], count: 2);
    expect($picks)->toEqual(['a']);
});

it('returns an empty array when count is zero or negative', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    expect($selector->pick(pool: ['a', 'b'], count: 0))->toEqual([]);
    expect($selector->pick(pool: ['a', 'b'], count: -1))->toEqual([]);
});
