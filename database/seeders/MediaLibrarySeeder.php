<?php

namespace Database\Seeders;

use App\Enums\MediaCategory;
use App\Models\Domain;
use App\Models\MediaItem;
use Illuminate\Database\Seeder;

class MediaLibrarySeeder extends Seeder
{
    /**
     * Seed each domain with a handful of MediaItems per category so operators
     * can test the picker / attachments end-to-end without uploading anything.
     *
     * Source files come from docs/block-references — the only large set of
     * real-looking PNGs already in the repo.
     */
    public function run(): void
    {
        $blockRefs = base_path('docs/block-references');

        if (! is_dir($blockRefs)) {
            $this->command?->warn("MediaLibrarySeeder: {$blockRefs} not found, skipping.");

            return;
        }

        $pngs = glob($blockRefs.'/*.png') ?: [];
        if (empty($pngs)) {
            $this->command?->warn('MediaLibrarySeeder: no fixture PNGs found, skipping.');

            return;
        }

        // Force the local 'public' disk so this seeder works without Bunny
        // credentials. Real uploads still go to whatever MEDIA_LIBRARY_DISK
        // points at.
        config()->set('media-library.disk_name', 'public');

        $byCategory = [
            MediaCategory::LandingPage->value => [
                'hero' => 4,
                'side' => 2,
                'section' => 3,
                'press_logo' => 4,
            ],
            MediaCategory::Product->value => [
                'product' => 3,
                'bump' => 2,
                'upsell' => 2,
            ],
            MediaCategory::Speakers->value => [
                'headshot' => 5,
            ],
            MediaCategory::Brand->value => [
                'logo' => 2,
                'favicon' => 1,
            ],
            MediaCategory::Downloadable->value => [
                'pdf' => 2,
                'ebook' => 1,
            ],
        ];

        $domains = Domain::query()->get();
        if ($domains->isEmpty()) {
            $this->command?->warn('MediaLibrarySeeder: no domains found, run DemoSeeder first.');

            return;
        }

        $cursor = 0;
        $total = 0;

        foreach ($domains as $domain) {
            foreach ($byCategory as $categoryValue => $subCategories) {
                foreach ($subCategories as $subCategory => $count) {
                    for ($i = 0; $i < $count; $i++) {
                        $source = $pngs[$cursor % count($pngs)];
                        $cursor++;

                        $this->createItem($domain, MediaCategory::from($categoryValue), $subCategory, $source);
                        $total++;
                    }
                }
            }
        }

        $this->command?->info("MediaLibrarySeeder: created {$total} media items across {$domains->count()} domains.");
    }

    private function createItem(Domain $domain, MediaCategory $category, string $subCategory, string $sourcePath): void
    {
        $fileName = basename($sourcePath);

        $item = MediaItem::create([
            'domain_id' => $domain->id,
            'category' => $category,
            'sub_category' => $subCategory,
            'disk' => config('media-library.disk_name'),
            'path' => 'pending',
            'file_name' => $fileName,
            'mime_type' => mime_content_type($sourcePath) ?: 'application/octet-stream',
            'size' => filesize($sourcePath) ?: 0,
            'caption' => "{$category->label()} — {$subCategory}",
            'alt_text' => "{$category->label()} {$subCategory} sample",
        ]);

        $item->addMedia($sourcePath)
            ->preservingOriginal()
            ->toMediaCollection('file');

        $media = $item->getFirstMedia('file');
        if ($media) {
            $item->update([
                'disk' => $media->disk,
                'path' => $media->getPathRelativeToRoot(),
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
            ]);
        }
    }
}
