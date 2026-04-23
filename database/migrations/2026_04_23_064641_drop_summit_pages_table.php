<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('summit_pages');
    }

    public function down(): void
    {
        Schema::create('summit_pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('summit_id')->constrained('summits')->cascadeOnDelete();
            $table->string('slug');
            $table->string('title', 500);
            $table->jsonb('content')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestampsTz();

            $table->unique(['summit_id', 'slug']);
            $table->index('summit_id');
        });
    }
};
