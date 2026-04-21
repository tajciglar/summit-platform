<?php

namespace App\Console\Commands;

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

class MediaLibraryDropLegacyCommand extends Command
{
    protected $signature = 'media-library:drop-legacy {--confirm : Actually delete files and rows}';

    protected $description = 'After migration soak: delete legacy Spatie media rows from the 6 migrated models';

    public function handle(): int
    {
        $classes = [
            Summit::class, Product::class, FunnelStepBump::class,
            Speaker::class, Domain::class, AppSettings::class,
        ];

        $unmigrated = DB::table('media')
            ->whereIn('model_type', $classes)
            ->whereNotIn('id', MediaItem::whereNotNull('legacy_spatie_media_id')->pluck('legacy_spatie_media_id'))
            ->count();

        if ($unmigrated > 0) {
            $this->error("Refusing to drop: {$unmigrated} legacy rows have no corresponding MediaItem. Run media-library:migrate first.");

            return self::FAILURE;
        }

        $rows = DB::table('media')->whereIn('model_type', $classes)->get();
        $this->info("Would delete {$rows->count()} legacy media rows and their files.");

        if (! $this->option('confirm')) {
            $this->warn('Dry run. Pass --confirm to actually delete.');

            return self::SUCCESS;
        }

        foreach ($rows as $row) {
            $path = "{$row->id}/{$row->file_name}";
            Storage::disk($row->disk)->delete($path);
            Storage::disk($row->disk)->deleteDirectory((string) $row->id);
        }

        DB::table('media')->whereIn('model_type', $classes)->delete();
        $this->info('Legacy rows deleted.');

        return self::SUCCESS;
    }
}
