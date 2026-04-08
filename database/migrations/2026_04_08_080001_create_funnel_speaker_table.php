<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funnel_speaker', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('speaker_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['funnel_id', 'speaker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_speaker');
    }
};
