<?php

namespace App\Console\Commands;

use App\Enums\MediaCategory;
use App\Models\AppSettings;
use App\Models\Domain;
use App\Models\FunnelStepBump;
use App\Models\MediaItem;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\Conversions\FileManipulator;

class MediaLibraryMigrateCommand extends Command
{
    protected $signature = 'media-library:migrate
        {--dry-run : Report counts and mappings without writing}
        {--model= : Migrate a single model class short-name (Summit, Product, ...)}';

    protected $description = 'Move legacy Spatie media rows into the MediaItem library';

    /**
     * @var array<class-string, array{category: MediaCategory, subCategory: string|null, role: string}>
     */
    private array $map = [];

    public function handle(): int
    {
        // Bind a no-op FileManipulator so image conversions are never attempted
        // during the migration. Conversions can be regenerated separately with
        // `php artisan media-library:regenerate` once the migration is complete.
        app()->bind(FileManipulator::class, fn () => new class extends FileManipulator
        {
            public function createDerivedFiles(mixed ...$args): void {}
        });

        $this->map = [
            Summit::class => ['category' => MediaCategory::LandingPage, 'subCategory' => 'hero', 'role' => 'hero'],
            Product::class => ['category' => MediaCategory::Product, 'subCategory' => 'product', 'role' => 'image'],
            FunnelStepBump::class => ['category' => MediaCategory::Product, 'subCategory' => 'bump', 'role' => 'image'],
            Speaker::class => ['category' => MediaCategory::Speakers, 'subCategory' => 'headshot', 'role' => 'photo'],
            Domain::class => ['category' => MediaCategory::Brand, 'subCategory' => 'logo', 'role' => 'logo'],
            AppSettings::class => ['category' => MediaCategory::Brand, 'subCategory' => 'logo', 'role' => 'logo'],
        ];

        $modelFilter = $this->option('model');
        $dryRun = (bool) $this->option('dry-run');

        $targetClasses = $modelFilter
            ? array_filter(array_keys($this->map), fn ($cls) => class_basename($cls) === $modelFilter)
            : array_keys($this->map);

        $total = 0;

        foreach ($targetClasses as $class) {
            $rows = DB::table('media')->where('model_type', $class)->get();
            $this->info("{$class}: {$rows->count()} legacy rows");

            foreach ($rows as $row) {
                if (MediaItem::where('legacy_spatie_media_id', $row->id)->exists()) {
                    continue;
                }

                if ($dryRun) {
                    $total++;

                    continue;
                }

                $this->migrateOne($class, $row);
                $total++;
            }
        }

        $this->info(($dryRun ? '[DRY] ' : '')."Migrated {$total} media rows.");

        return self::SUCCESS;
    }

    private function migrateOne(string $class, object $row): void
    {
        $map = $this->map[$class];
        $owner = $class::find($row->model_id);
        if (! $owner) {
            $this->warn("  skipped media id={$row->id}: owner not found");

            return;
        }

        $domainId = $this->resolveDomainId($owner, $class);

        $item = MediaItem::create([
            'domain_id' => $domainId,
            'category' => $map['category'],
            'sub_category' => $map['subCategory'],
            'disk' => $row->disk,
            'path' => "{$row->id}/{$row->file_name}",
            'file_name' => $row->file_name,
            'mime_type' => $row->mime_type,
            'size' => $row->size,
            'caption' => $row->name,
            'alt_text' => $row->name,
            'created_by_user_id' => null,
            'legacy_spatie_media_id' => $row->id,
        ]);

        $sourceDisk = $row->disk;
        $sourcePath = "{$row->id}/{$row->file_name}";
        $absolute = Storage::disk($sourceDisk)->path($sourcePath);

        if (! file_exists($absolute)) {
            $this->warn("  skipped media id={$row->id}: source file missing at {$absolute}");
            $item->delete();

            return;
        }

        $media = $item->addMedia($absolute)
            ->preservingOriginal()
            ->toMediaCollection('file');

        $item->update([
            'disk' => $media->disk,
            'path' => $media->getPathRelativeToRoot(),
            'file_name' => $media->file_name,
            'size' => $media->size,
            'mime_type' => $media->mime_type,
        ]);

        DB::table('media_item_attachments')->insert([
            'id' => (string) Str::uuid(),
            'media_item_id' => $item->id,
            'attachable_id' => $owner->getKey(),
            'attachable_type' => $class,
            'role' => $map['role'],
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function resolveDomainId(object $owner, string $class): ?string
    {
        return match ($class) {
            Summit::class => $owner->domain_id,
            Product::class, Speaker::class, FunnelStepBump::class => $owner->summit?->domain_id,
            Domain::class => $owner->id,
            AppSettings::class => null,
            default => null,
        };
    }
}
