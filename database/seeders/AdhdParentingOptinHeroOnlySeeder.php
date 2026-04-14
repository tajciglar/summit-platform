<?php

namespace Database\Seeders;

use App\Models\FunnelStep;
use App\Models\Summit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Minimal smoke-test seeder — populates the ADHD Parenting optin step
 * with a single HeroWithCountdown block so the catch-all route renders
 * something visible end-to-end.
 *
 * Replace with the full Part H composition when more blocks exist.
 */
class AdhdParentingOptinHeroOnlySeeder extends Seeder
{
    public function run(): void
    {
        $summit = Summit::where('slug', 'adhd-parenting-summit-2026')->firstOrFail();
        $step = FunnelStep::whereHas('funnel', fn ($q) => $q->where('summit_id', $summit->id))
            ->where('slug', 'optin')
            ->firstOrFail();

        $step->update([
            'content' => [
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'StickyCountdownBar',
                    'version' => 1,
                    'props' => [
                        'message' => 'Summit starts in',
                        'countdownTarget' => '2026-06-01T00:00:00Z',
                        'ctaLabel' => 'Claim Free Ticket',
                        'ctaUrl' => '#register',
                        'hideWhenExpired' => true,
                        'position' => 'top',
                        'variant' => 'gradient',
                    ],
                ],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'HeroWithCountdown',
                    'version' => 1,
                    'props' => [
                        'eyebrow' => 'LIVE MARCH 9–13, 2026',
                        'headline' => "WORLD'S LARGEST ADHD PARENTING SUMMIT",
                        'subheadline' => 'Become Empowered Parent In 5 Days',
                        'bodyLines' => [
                            '40+ Leading Experts',
                            'Focus · Impulsivity · Outbursts · Screen Management',
                        ],
                        'speakerCountLabel' => '40+ Leading Experts',
                        'countdownTarget' => '2026-03-09T00:00:00Z',
                        'primaryCtaLabel' => 'GET INSTANT ACCESS',
                        'secondaryCtaLabel' => 'Claim your FREE ticket',
                        'backgroundStyle' => 'gradient',
                    ],
                ],
            ],
        ]);
    }
}
