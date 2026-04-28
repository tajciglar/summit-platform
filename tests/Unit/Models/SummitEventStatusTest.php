<?php

namespace Tests\Unit\Models;

use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SummitEventStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_label_is_event_dates_in_pre_phase(): void
    {
        Carbon::setTestNow('2026-04-15 10:00:00');

        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => '2026-04-10 00:00:00',
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
            'post_summit_starts_at' => '2026-04-30 00:00:00',
        ]);

        $this->assertSame('ONLINE Event, 27–29 April', $summit->eventStatusLabel());
    }

    public function test_label_is_event_live_in_during_phase(): void
    {
        Carbon::setTestNow('2026-04-28 12:00:00');

        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => '2026-04-10 00:00:00',
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
            'post_summit_starts_at' => '2026-04-30 00:00:00',
        ]);

        $this->assertSame('Event live', $summit->eventStatusLabel());
    }

    public function test_label_is_event_ended_in_post_phase(): void
    {
        Carbon::setTestNow('2026-05-05 12:00:00');

        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => '2026-04-10 00:00:00',
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
            'post_summit_starts_at' => '2026-04-30 00:00:00',
        ]);

        $this->assertSame('Event ended', $summit->eventStatusLabel());
    }

    public function test_label_is_empty_when_no_dates(): void
    {
        $summit = Summit::factory()->create([
            'pre_summit_starts_at' => null,
            'late_pre_summit_starts_at' => null,
            'during_summit_starts_at' => null,
            'post_summit_starts_at' => null,
            'ends_at' => null,
        ]);

        $this->assertSame('', $summit->eventStatusLabel());
    }

    public function test_formatted_date_range_same_month(): void
    {
        $summit = Summit::factory()->create([
            'during_summit_starts_at' => '2026-04-27 00:00:00',
            'ends_at' => '2026-04-29 23:59:59',
        ]);

        $this->assertSame('27–29 April', $summit->formattedDateRange());
    }

    public function test_formatted_date_range_different_months(): void
    {
        $summit = Summit::factory()->create([
            'during_summit_starts_at' => '2026-04-30 00:00:00',
            'ends_at' => '2026-05-02 23:59:59',
        ]);

        $this->assertSame('30 April – 2 May', $summit->formattedDateRange());
    }

    public function test_formatted_date_range_different_years(): void
    {
        $summit = Summit::factory()->create([
            'during_summit_starts_at' => '2026-12-30 00:00:00',
            'ends_at' => '2027-01-02 23:59:59',
        ]);

        $this->assertSame('30 Dec 2026 – 2 Jan 2027', $summit->formattedDateRange());
    }
}
