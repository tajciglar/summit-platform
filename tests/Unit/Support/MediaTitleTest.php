<?php

use App\Support\MediaTitle;

it('normalizes a kebab/snake/dotted filename into a title-cased label', function (): void {
    expect(MediaTitle::fromFilename('my-photo_v2.JPG'))->toBe('My Photo V2');
});

it('strips the extension and collapses repeated separators', function (): void {
    expect(MediaTitle::fromFilename('hero--shot__final.png'))->toBe('Hero Shot Final');
});

it('handles filenames with no extension', function (): void {
    expect(MediaTitle::fromFilename('plain_name'))->toBe('Plain Name');
});
