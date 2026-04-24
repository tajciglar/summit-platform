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
            'goes_live_at' => fake()->dateTimeBetween('-7 days', '+14 days'),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_featured' => fake()->boolean(25),
            'free_access_window_hours' => 24,
        ];
    }

    /**
     * Attach the created speaker to a summit via the `speaker_summit` pivot.
     * Replaces the old pattern `Speaker::factory()->create(['summit_id' => X,
     * 'day_number' => Y])` now that those columns are gone.
     */
    public function forSummit(Summit|string $summit, ?int $day = null): static
    {
        $summitId = $summit instanceof Summit ? $summit->id : $summit;

        return $this->afterCreating(function (Speaker $speaker) use ($summitId, $day): void {
            DB::table('speaker_summit')->updateOrInsert(
                ['speaker_id' => $speaker->id, 'summit_id' => $summitId],
                [
                    'day_number' => $day,
                    'sort_order' => $speaker->sort_order ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        });
    }
}
