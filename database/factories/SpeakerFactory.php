<?php

namespace Database\Factories;

use App\Models\Speaker;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @extends Factory<Speaker>
 */
class SpeakerFactory extends Factory
{
    protected $model = Speaker::class;

    public function definition(): array
    {
        $first = fake()->firstName();
        $last = fake()->lastName();

        return [
            'summit_id' => Summit::factory(),
            'slug' => Str::slug("{$first}-{$last}").'-'.fake()->unique()->numberBetween(100, 999),
            'first_name' => $first,
            'last_name' => $last,
            'email' => fake()->unique()->safeEmail(),
            'title' => fake()->jobTitle().' at '.fake()->company(),
            'short_bio' => fake()->sentence(20),
            'long_bio' => fake()->paragraphs(3, true),
            'social_links' => [
                'twitter' => 'https://twitter.com/'.fake()->userName(),
                'linkedin' => 'https://linkedin.com/in/'.fake()->userName(),
            ],
            'masterclass_title' => fake()->catchPhrase(),
            'masterclass_description' => fake()->paragraph(),
            'rating' => fake()->numberBetween(3, 5),
            'goes_live_at' => fake()->dateTimeBetween('-7 days', '+14 days'),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_featured' => fake()->boolean(25),
            'free_access_window_hours' => 24,
        ];
    }

    /**
     * Mirror every factory-created speaker into the `speaker_summit` pivot so
     * the new belongsToMany relation picks it up alongside the legacy
     * `speakers.summit_id` column. This keeps existing test callsites
     * like `Speaker::factory()->create(['summit_id' => X])` working through
     * the M2M transition (C1–C3). Dropped once the legacy column is gone.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Speaker $speaker): void {
            if ($speaker->summit_id === null) {
                return;
            }

            DB::table('speaker_summit')->updateOrInsert(
                ['speaker_id' => $speaker->id, 'summit_id' => $speaker->summit_id],
                [
                    'day_number' => $speaker->day_number,
                    'sort_order' => $speaker->sort_order ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        });
    }
}
