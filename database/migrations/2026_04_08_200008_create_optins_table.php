<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('optins', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email', 255);
            $table->string('first_name', 255)->nullable();
            $table->foreignUuid('summit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('funnel_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('funnel_step_id')->nullable()->constrained()->nullOnDelete();
            $table->text('source_url')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('utm_source', 255)->nullable();
            $table->string('utm_medium', 255)->nullable();
            $table->string('utm_campaign', 255)->nullable();
            $table->string('utm_content', 255)->nullable();
            $table->string('utm_term', 255)->nullable();
            $table->boolean('activecampaign_synced')->default(false);
            $table->timestampTz('created_at')->useCurrent();

            $table->index('email');
            $table->index('user_id');
            $table->index('summit_id');
            $table->index('funnel_id');
            $table->index('created_at');
        });

        // Partial index for AC sync job
        DB::statement('CREATE INDEX optins_ac_unsynced ON optins (activecampaign_synced) WHERE NOT activecampaign_synced');
    }

    public function down(): void
    {
        Schema::dropIfExists('optins');
    }
};
