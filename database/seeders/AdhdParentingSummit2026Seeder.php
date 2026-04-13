<?php

namespace Database\Seeders;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitSpeaker;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdhdParentingSummit2026Seeder extends Seeder
{
    public function run(): void
    {
        $startsAt = Carbon::parse('2026-03-09 00:00:00');

        $summit = Summit::updateOrCreate(
            ['slug' => 'adhd-parenting-summit-2026'],
            [
                'title' => 'ADHD Parenting Summit 2026',
                'description' => "World's Largest ADHD Parenting Summit — Become Empowered Parent In 5 Days. 40+ leading experts covering focus, impulsivity, outbursts, and screen management.",
                'topic' => 'ADHD parenting strategies and tools',
                'timezone' => 'America/New_York',
                'starts_at' => $startsAt,
                'ends_at' => Carbon::parse('2026-03-13 23:59:59'),
                'status' => 'published',
                'current_phase' => 'pre_summit',
                'summit_type' => 'free',
            ]
        );

        $funnel = Funnel::updateOrCreate(
            ['summit_id' => $summit->id, 'slug' => 'main'],
            [
                'name' => 'ADHD Parenting Summit 2026 Main Funnel',
                'description' => 'Public optin → checkout → upsell → thank-you',
                'is_active' => true,
                'theme' => [
                    'primaryColor' => '#5e4d9b',
                    'accentColor' => '#00b553',
                    'fontHeading' => 'Inter',
                    'fontBody' => 'Inter',
                    'logoUrl' => null,
                    'backgroundStyle' => 'light',
                ],
            ]
        );

        FunnelStep::updateOrCreate(
            ['funnel_id' => $funnel->id, 'slug' => 'optin'],
            [
                'step_type' => 'optin',
                'template' => 'custom-blocks',
                'name' => 'Main Optin',
                'content' => [],
                'sort_order' => 0,
                'is_published' => true,
            ]
        );

        $this->seedSpeakers($summit, $startsAt);
    }

    private function seedSpeakers(Summit $summit, Carbon $startsAt): void
    {
        $speakers = [
            // Day 1 — Focus & Attention
            ['first' => 'Stephen', 'last' => 'Cowan', 'title' => 'MD, FAAP', 'day' => 1, 'session' => 'Focus Foundations for the ADHD Brain'],
            ['first' => 'Pippa', 'last' => 'Simou', 'title' => 'Parenting Coach', 'day' => 1, 'session' => 'Butterfly Mind Strategies'],
            ['first' => 'Peg', 'last' => 'Dawson', 'title' => 'EdD', 'day' => 1, 'session' => 'Executive Function Skills'],
            ['first' => 'Richard', 'last' => 'Guare', 'title' => 'PhD', 'day' => 1, 'session' => 'Smart but Scattered Kids'],
            ['first' => 'Salif', 'last' => 'Mahamane', 'title' => 'PhD', 'day' => 1, 'session' => 'Nature and Attention'],
            ['first' => 'Stephen P.', 'last' => 'Hinsworth', 'title' => 'MD', 'day' => 1, 'session' => 'Neurobiology of Focus'],

            // Day 2 — Emotional Regulation
            ['first' => 'Mona', 'last' => 'Delahooke', 'title' => 'PhD', 'day' => 2, 'session' => 'Brain-Body Parenting'],
            ['first' => 'Ross', 'last' => 'Greene', 'title' => 'PhD', 'day' => 2, 'session' => 'Collaborative Problem Solving'],
            ['first' => 'Dan', 'last' => 'Siegel', 'title' => 'MD', 'day' => 2, 'session' => 'The Whole-Brain Child'],
            ['first' => 'Tina', 'last' => 'Payne Bryson', 'title' => 'PhD', 'day' => 2, 'session' => 'No-Drama Discipline'],
            ['first' => 'Shimi', 'last' => 'Kang', 'title' => 'MD', 'day' => 2, 'session' => 'The Dolphin Parent'],
            ['first' => 'Rebecca', 'last' => 'Kennedy', 'title' => 'PhD', 'day' => 2, 'session' => 'Good Inside'],
            ['first' => 'Gordon', 'last' => 'Neufeld', 'title' => 'PhD', 'day' => 2, 'session' => 'Hold On to Your Kids'],

            // Day 3 — Routines & Time
            ['first' => 'Edward', 'last' => 'Hallowell', 'title' => 'MD', 'day' => 3, 'session' => 'Driven to Distraction'],
            ['first' => 'John', 'last' => 'Ratey', 'title' => 'MD', 'day' => 3, 'session' => 'Spark: Exercise and the Brain'],
            ['first' => 'Russell', 'last' => 'Barkley', 'title' => 'PhD', 'day' => 3, 'session' => 'Taking Charge of ADHD'],
            ['first' => 'Joel', 'last' => 'Nigg', 'title' => 'PhD', 'day' => 3, 'session' => 'Getting Ahead of ADHD'],
            ['first' => 'Thomas E.', 'last' => 'Brown', 'title' => 'PhD', 'day' => 3, 'session' => 'Smart But Stuck'],
            ['first' => 'Ari', 'last' => 'Tuckman', 'title' => 'PsyD', 'day' => 3, 'session' => 'Time Management for ADHD'],
            ['first' => 'Sharon', 'last' => 'Saline', 'title' => 'PsyD', 'day' => 3, 'session' => 'What Your ADHD Child Wishes'],
            ['first' => 'Norrine', 'last' => 'Russell', 'title' => 'PhD', 'day' => 3, 'session' => 'Routine Systems That Stick'],

            // Day 4 — School Survival
            ['first' => 'Ned', 'last' => 'Hallowell Jr', 'title' => 'MD', 'day' => 4, 'session' => 'School Strategies for ADHD'],
            ['first' => 'Laura', 'last' => 'Kastner', 'title' => 'PhD', 'day' => 4, 'session' => 'Wise-Minded Parenting'],
            ['first' => 'Wendy', 'last' => 'Mogel', 'title' => 'PhD', 'day' => 4, 'session' => 'Blessing of a B Minus'],
            ['first' => 'Deborah', 'last' => 'Reber', 'title' => 'MA', 'day' => 4, 'session' => 'Differently Wired'],
            ['first' => 'Diane', 'last' => 'Dempster', 'title' => 'Coach', 'day' => 4, 'session' => 'Impact Parents'],
            ['first' => 'Elaine', 'last' => 'Taylor-Klaus', 'title' => 'CPCC', 'day' => 4, 'session' => 'Parenting ADHD with Impact'],
            ['first' => 'Thomas', 'last' => 'Phelan', 'title' => 'PhD', 'day' => 4, 'session' => '1-2-3 Magic'],
            ['first' => 'Rick', 'last' => 'Lavoie', 'title' => 'MA', 'day' => 4, 'session' => 'Understanding Learning Differences'],

            // Day 5 — Adult ADHD
            ['first' => 'Sari', 'last' => 'Solden', 'title' => 'MS, LMFT', 'day' => 5, 'session' => 'Women with ADHD'],
            ['first' => 'Terry', 'last' => 'Matlen', 'title' => 'MSW', 'day' => 5, 'session' => 'Survival Tips for Women with AD/HD'],
            ['first' => 'Patricia', 'last' => 'Quinn', 'title' => 'MD', 'day' => 5, 'session' => 'ADHD in Women and Girls'],
            ['first' => 'Kathleen', 'last' => 'Nadeau', 'title' => 'PhD', 'day' => 5, 'session' => "A Woman's Guide to ADHD"],
            ['first' => 'Ellen', 'last' => 'Littman', 'title' => 'PhD', 'day' => 5, 'session' => 'Understanding Girls with ADHD'],
            ['first' => 'Tamara', 'last' => 'Rosier', 'title' => 'PhD', 'day' => 5, 'session' => "Your Brain's Not Broken"],
            ['first' => 'Stephanie', 'last' => 'Moulton Sarkis', 'title' => 'PhD', 'day' => 5, 'session' => 'Adult ADHD'],
            ['first' => 'Joel', 'last' => 'Young', 'title' => 'MD', 'day' => 5, 'session' => 'ADHD Across Generations'],
        ];

        foreach ($speakers as $i => $spec) {
            $slug = Str::slug("{$spec['first']} {$spec['last']}");

            $speaker = Speaker::updateOrCreate(
                ['slug' => $slug],
                [
                    'first_name' => $spec['first'],
                    'last_name' => $spec['last'],
                    'title' => $spec['title'],
                    'short_description' => "Expert in {$spec['session']}.",
                    'long_description' => "Featured speaker on Day {$spec['day']} of the ADHD Parenting Summit 2026. Session: {$spec['session']}.",
                    'photo_url' => 'https://placehold.co/400x400/5e4d9b/ffffff.png?text='.urlencode("{$spec['first']} {$spec['last']}"),
                ]
            );

            SummitSpeaker::updateOrCreate(
                ['summit_id' => $summit->id, 'speaker_id' => $speaker->id],
                [
                    'masterclass_title' => $spec['session'],
                    'masterclass_description' => "Day {$spec['day']} session on ADHD parenting.",
                    'presentation_day' => $startsAt->copy()->addDays($spec['day'] - 1)->toDateString(),
                    'sort_order' => $i,
                    'is_featured' => false,
                    'rating' => null,
                    'free_access_window_hours' => 24,
                ]
            );
        }
    }
}
