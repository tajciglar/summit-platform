<?php

namespace Tests\Feature;

use App\Enums\LandingPageDraftStatus;
use App\Jobs\PruneMockupsJob;
use App\Models\LandingPageDraft;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PruneMockupsJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_deletes_mockup_directories_of_old_rejected_drafts(): void
    {
        Storage::fake('public');

        $old = LandingPageDraft::factory()->create(['status' => LandingPageDraftStatus::Archived]);
        $young = LandingPageDraft::factory()->create(['status' => LandingPageDraftStatus::Archived]);
        $active = LandingPageDraft::factory()->create(['status' => 'ready']);

        Storage::disk('public')->put("draft-mockups/{$old->id}/a.png", 'x');
        Storage::disk('public')->put("draft-mockups/{$young->id}/a.png", 'x');
        Storage::disk('public')->put("draft-mockups/{$active->id}/a.png", 'x');

        // Age the old one past the cutoff (default 7d).
        $old->timestamps = false;
        $old->updated_at = now()->subDays(10);
        $old->save();

        (new PruneMockupsJob)->handle();

        $this->assertFalse(Storage::disk('public')->exists("draft-mockups/{$old->id}/a.png"));
        $this->assertTrue(Storage::disk('public')->exists("draft-mockups/{$young->id}/a.png"));
        $this->assertTrue(Storage::disk('public')->exists("draft-mockups/{$active->id}/a.png"));
    }
}
