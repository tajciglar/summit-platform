<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds auto-publish wiring so the "Generate all steps" funnel action can queue
 * drafts that automatically promote to FunnelStep.page_content once they reach
 * Ready, without the operator picking a winner. `published_by_user_id` records
 * which user kicked off the auto-publish so FunnelStepRevision audit entries
 * stay attributable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->boolean('auto_publish')->default(false);
            $table->foreignUuid('published_by_user_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('published_by_user_id');
            $table->dropColumn('auto_publish');
        });
    }
};
