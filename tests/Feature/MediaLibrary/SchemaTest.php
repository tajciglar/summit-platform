<?php

use Illuminate\Support\Facades\Schema;

it('creates media_items table with expected columns', function (): void {
    expect(Schema::hasTable('media_items'))->toBeTrue();
    expect(Schema::hasColumn('media_items', 'domain_id'))->toBeFalse();
    expect(Schema::hasColumns('media_items', [
        'id',
        'category',
        'sub_category',
        'disk',
        'path',
        'file_name',
        'mime_type',
        'size',
        'width',
        'height',
        'caption',
        'alt_text',
        'created_by_user_id',
        'legacy_spatie_media_id',
        'created_at',
        'updated_at',
    ]))->toBeTrue();
});

it('creates media_item_attachments pivot table with expected columns', function (): void {
    expect(Schema::hasTable('media_item_attachments'))->toBeTrue();
    expect(Schema::hasColumns('media_item_attachments', [
        'id',
        'media_item_id',
        'attachable_id',
        'attachable_type',
        'role',
        'sort_order',
        'created_at',
        'updated_at',
    ]))->toBeTrue();
});
