<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Normalize legacy 'pending' status rows to 'queued'.
     *
     * The original migration defaulted status to 'pending', but every live
     * code path writes 'queued'. This ensures every row fits
     * App\Enums\LandingPageDraftStatus.
     */
    public function up(): void
    {
        DB::table('landing_page_drafts')
            ->where('status', 'pending')
            ->update(['status' => 'queued']);
    }

    public function down(): void
    {
        DB::table('landing_page_drafts')
            ->where('status', 'queued')
            ->update(['status' => 'pending']);
    }
};
