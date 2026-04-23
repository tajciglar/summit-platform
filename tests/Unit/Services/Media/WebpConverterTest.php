<?php

use App\Services\Media\WebpConverter;

beforeEach(function () {
    if (! extension_loaded('imagick')) {
        $this->markTestSkipped('Imagick not available');
    }
});

it('converts a JPEG to WebP', function () {
    $tempPath = tempnam(sys_get_temp_dir(), 'jpg_').'.jpg';
    $img = imagecreatetruecolor(100, 100);
    imagejpeg($img, $tempPath);
    imagedestroy($img);

    $result = (new WebpConverter)->convert($tempPath, 'photo.jpg', 'image/jpeg');

    expect($result)->not->toBeNull();
    expect($result['fileName'])->toBe('photo.webp');
    expect($result['mimeType'])->toBe('image/webp');
    expect(file_exists($result['path']))->toBeTrue();
    expect(mime_content_type($result['path']))->toBe('image/webp');

    @unlink($tempPath);
    @unlink($result['path']);
});

it('returns null for image/webp (already optimal)', function () {
    $result = (new WebpConverter)->convert('/tmp/fake.webp', 'photo.webp', 'image/webp');
    expect($result)->toBeNull();
});

it('returns null for image/svg+xml', function () {
    $result = (new WebpConverter)->convert('/tmp/fake.svg', 'logo.svg', 'image/svg+xml');
    expect($result)->toBeNull();
});

it('returns null for image/gif (animation-friendly passthrough)', function () {
    $result = (new WebpConverter)->convert('/tmp/fake.gif', 'loop.gif', 'image/gif');
    expect($result)->toBeNull();
});

it('returns null for non-image mimes (e.g. PDF)', function () {
    $result = (new WebpConverter)->convert('/tmp/fake.pdf', 'doc.pdf', 'application/pdf');
    expect($result)->toBeNull();
});

it('returns null and logs when conversion throws (e.g. corrupt file)', function () {
    $badPath = tempnam(sys_get_temp_dir(), 'bad_').'.jpg';
    file_put_contents($badPath, 'not an image');

    $result = (new WebpConverter)->convert($badPath, 'corrupt.jpg', 'image/jpeg');

    expect($result)->toBeNull();

    @unlink($badPath);
});
