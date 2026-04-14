<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('funnel_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('summit_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('funnel_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('queued'); // queued, architecting, writing, completed, failed
            $table->unsignedTinyInteger('progress')->default(0); // 0..100
            $table->string('current_step')->nullable();
            $table->json('brief');
            $table->json('architect_output')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funnel_generations');
    }
};
