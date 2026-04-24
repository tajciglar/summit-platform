<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Meta (Facebook) Pixel ID, one per brand. Set in Filament. The Next.js
 * public renderer injects the pixel snippet + PageView when present.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE domains ADD COLUMN meta_pixel_id VARCHAR(32)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE domains DROP COLUMN IF EXISTS meta_pixel_id');
    }
};
