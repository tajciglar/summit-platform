<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            if (! Schema::hasColumn('summits', 'pre_summit_starts_at')) {
                $table->timestampTz('pre_summit_starts_at')->nullable()->after('ends_at');
            }
            if (! Schema::hasColumn('summits', 'late_pre_summit_starts_at')) {
                $table->timestampTz('late_pre_summit_starts_at')->nullable()->after('pre_summit_starts_at');
            }
            if (! Schema::hasColumn('summits', 'during_summit_starts_at')) {
                $table->timestampTz('during_summit_starts_at')->nullable()->after('late_pre_summit_starts_at');
            }
            if (! Schema::hasColumn('summits', 'post_summit_starts_at')) {
                $table->timestampTz('post_summit_starts_at')->nullable()->after('during_summit_starts_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->dropColumn([
                'pre_summit_starts_at',
                'late_pre_summit_starts_at',
                'during_summit_starts_at',
                'post_summit_starts_at',
            ]);
        });
    }
};
