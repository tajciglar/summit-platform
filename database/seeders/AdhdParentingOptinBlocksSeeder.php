<?php

namespace Database\Seeders;

use App\Models\FunnelStep;
use App\Models\Summit;
use App\Models\SummitSpeaker;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Composes the ADHD Parenting Summit 2026 optin page as a full
 * 25-block stack — parity with parenting-summits.com production
 * layout. Pulls real Speaker UUIDs seeded in AdhdParentingSummitSeeder
 * and groups them by computed day number (1..5).
 */
class AdhdParentingOptinBlocksSeeder extends Seeder
{
    public function run(): void
    {
        $summit = Summit::where('slug', 'adhd-parenting-summit-2026')->firstOrFail();
        $step = FunnelStep::whereHas('funnel', fn ($q) => $q->where('summit_id', $summit->id))
            ->where('slug', 'optin')
            ->firstOrFail();

        $startsAt = Carbon::parse($summit->starts_at)->startOfDay();

        // Same signed-diff convention as FunnelResolveController:
        // starts->diffInDays(presentation) + 1.
        $speakersByDay = SummitSpeaker::where('summit_id', $summit->id)
            ->get()
            ->groupBy(function ($ss) use ($startsAt) {
                if (! $ss->presentation_day) {
                    return 0;
                }
                return $startsAt->diffInDays(Carbon::parse($ss->presentation_day)->startOfDay()) + 1;
            })
            ->map(fn ($group) => $group->pluck('speaker_id')->all());

        $speakerIdsForDay = function (int $day) use ($speakersByDay): ?array {
            $ids = $speakersByDay[$day] ?? [];
            return empty($ids) ? null : $ids;
        };

        $blocks = [
            $this->block('StickyCountdownBar', [
                'message' => 'Summit starts in',
                // Use summit start if in future, else a demo date so the bar stays visible.
                'countdownTarget' => Carbon::parse($summit->starts_at)->isFuture()
                    ? Carbon::parse($summit->starts_at)->toIso8601ZuluString()
                    : Carbon::now()->addDays(30)->toIso8601ZuluString(),
                'ctaLabel' => 'Claim Free Ticket',
                'ctaUrl' => '#register',
                'hideWhenExpired' => true,
                'position' => 'top',
                'variant' => 'gradient',
            ]),
            $this->block('HeroWithCountdown', [
                'eyebrow' => 'LIVE MARCH 9–13, 2026',
                'headline' => "WORLD'S LARGEST ADHD PARENTING SUMMIT",
                'subheadline' => 'Become Empowered Parent In 5 Days',
                'bodyLines' => ['40+ Leading Experts', 'Focus · Impulsivity · Outbursts · Screen Management'],
                'speakerCountLabel' => '40+ Leading Experts',
                'countdownTarget' => '2026-03-09T00:00:00Z',
                'primaryCtaLabel' => 'GET INSTANT ACCESS',
                'secondaryCtaLabel' => 'Claim your FREE ticket',
                'backgroundStyle' => 'gradient',
            ]),
            $this->block('SocialProofBadge', [
                'headline' => 'Loved by 73,124 committed parents',
                'badgeText' => '73,124',
                'backgroundColor' => 'light',
            ]),
            $this->block('LogoStripCarousel', [
                'headline' => 'AS FEATURED IN',
                'logos' => [
                    ['name' => 'Aleteia', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Aleteia'],
                    ['name' => 'Atlantic', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Atlantic'],
                    ['name' => 'Scientific American', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=SciAm'],
                    ['name' => 'Guardian', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Guardian'],
                    ['name' => 'HuffPost', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=HuffPost'],
                    ['name' => 'BBC', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=BBC'],
                    ['name' => 'Washington Post', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=WaPo'],
                    ['name' => 'TEDx', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=TEDx'],
                    ['name' => 'Time', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Time'],
                    ['name' => 'USA Today', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=USAToday'],
                    ['name' => 'NYT', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=NYT'],
                    ['name' => 'Forbes', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Forbes'],
                ],
                'animation' => 'scroll',
            ]),
            $this->block('StatsBar3Item', [
                'stats' => [
                    ['value' => '5 DAYS', 'label' => 'of transformative learning'],
                    ['value' => '40+', 'label' => 'world-class speakers'],
                    ['value' => '50,000+', 'label' => 'attendees expected'],
                ],
                'backgroundColor' => 'light',
            ]),
            $this->block('FeatureWithImage', [
                'headline' => 'What is ADHD Parenting Summit 2026?',
                'bodyRich' => "A reframed approach — 5 days instead of 3, 40+ world-class experts, deeper understanding of your ADHD child.\n\nPractical, science-backed strategies you can implement the same night you learn them.",
                'imageUrl' => 'https://placehold.co/1000x700/5e4d9b/ffffff.png?text=Summit+Overview',
                'imagePosition' => 'right',
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
            ]),
            $this->block('SpeakerGridDay', array_filter([
                'day' => 1, 'dayLabel' => 'Day 1', 'theme' => 'The Butterfly Mind',
                'subtitle' => 'Focus & attention strategies',
                'speakerIds' => $speakerIdsForDay(1),
                'expandable' => true,
            ], fn ($v) => $v !== null)),
            $this->block('SpeakerGridDay', array_filter([
                'day' => 2, 'dayLabel' => 'Day 2', 'theme' => 'From Storm To Calm',
                'subtitle' => 'Emotional regulation & impulse control',
                'speakerIds' => $speakerIdsForDay(2),
                'expandable' => true,
            ], fn ($v) => $v !== null)),
            $this->block('SpeakerGridDay', array_filter([
                'day' => 3, 'dayLabel' => 'Day 3', 'theme' => 'Taming The Time Monster',
                'subtitle' => 'Routines and time management',
                'speakerIds' => $speakerIdsForDay(3),
                'expandable' => true,
            ], fn ($v) => $v !== null)),
            $this->block('SpeakerGridDay', array_filter([
                'day' => 4, 'dayLabel' => 'Day 4', 'theme' => 'School Survival',
                'subtitle' => 'Academic performance and school strategies',
                'speakerIds' => $speakerIdsForDay(4),
                'expandable' => true,
            ], fn ($v) => $v !== null)),
            $this->block('SpeakerGridDay', array_filter([
                'day' => 5, 'dayLabel' => 'Day 5', 'theme' => 'The ADHD Parent Paradox',
                'subtitle' => 'Parenting when you have ADHD too',
                'speakerIds' => $speakerIdsForDay(5),
                'expandable' => true,
            ], fn ($v) => $v !== null)),
            $this->block('LearningOutcomes', [
                'eyebrow' => 'What you\'ll take away',
                'headline' => 'Six skill areas, every one with tools you can try tonight',
                'items' => [
                    ['iconName' => 'target', 'title' => 'Improve Attention', 'description' => 'Techniques that help your child focus across daily life.'],
                    ['iconName' => 'users', 'title' => 'Digital-Age Challenges', 'description' => 'Manage screens without constant battles.'],
                    ['iconName' => 'book', 'title' => 'School Success', 'description' => 'Strategies for homework, organization, and teacher partnership.'],
                    ['iconName' => 'bolt', 'title' => 'Meltdown Management', 'description' => 'De-escalate storms before they start.'],
                    ['iconName' => 'heart', 'title' => 'Emotional Regulation', 'description' => 'Build emotional intelligence in ADHD kids.'],
                    ['iconName' => 'message', 'title' => 'Routine Creation', 'description' => 'Routines that actually stick.'],
                ],
            ]),
            $this->block('BonusStack', [
                'eyebrow' => 'FREE BONUSES',
                'headline' => 'Register Today And Receive EXCLUSIVE ACCESS To: The ADHD Parenting Mastery Collection',
                'introText' => 'Get instant access to 3 premium masterclasses from previous summits.',
                'bonuses' => [
                    ['title' => 'Dr. Hallowell Masterclass', 'description' => 'Driven to Distraction — the full session.', 'valueLabel' => '($97 value)'],
                    ['title' => 'Dr. King Masterclass', 'description' => 'Parenting with ADHD Calm.', 'valueLabel' => '($97 value)'],
                    ['title' => 'Dr. Brooks Masterclass', 'description' => 'Raising Resilient Kids.', 'valueLabel' => '($97 value)'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
            ]),
            $this->block('FoundersSection', [
                'eyebrow' => 'About the hosts',
                'headline' => 'Meet The Summit Organizers',
                'bodyRich' => "We've helped 253,788 families transform their relationship with ADHD.\n\nPractical, empathetic, science-backed — no fluff, no shame, no one-size-fits-all.",
                'founders' => [
                    ['name' => 'Spela Repovs', 'title' => 'Co-founder, StrategicParenting', 'photoUrl' => 'https://placehold.co/400x400/5e4d9b/ffffff.png?text=Spela'],
                    ['name' => 'Elaine Taylor-Klaus', 'title' => 'CPCC, Co-founder', 'photoUrl' => 'https://placehold.co/400x400/5e4d9b/ffffff.png?text=Elaine'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
            ]),
            $this->block('SocialProofBadge', [
                'headline' => 'Instagram 120k · Facebook 230k · Trustpilot 4.9/5',
                'badgeText' => '4.9/5',
                'backgroundColor' => 'transparent',
            ]),
            $this->block('VideoTestimonialSection', [
                'headline' => 'Hear From Experts Why YOU Should Join This Summit',
                'subheadline' => 'Two short clips from past attendees and speakers on why this summit is different.',
                'videos' => [
                    ['embedUrl' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'title' => 'Why this summit matters', 'speakerName' => 'Dr. Hallowell'],
                    ['embedUrl' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'title' => 'A new parenting paradigm', 'speakerName' => 'Dr. Dawson'],
                ],
                'layout' => 'grid',
            ]),
            $this->block('TestimonialCarousel', [
                'eyebrow' => 'Parent reviews',
                'headline' => 'What Parents Are Saying',
                'testimonials' => [
                    ['quote' => 'This summit changed everything. Our mornings went from war zone to peace.', 'authorName' => 'Jo C.', 'rating' => 5],
                    ['quote' => 'I finally understand my daughter. The speakers are a gift.', 'authorName' => 'Sally W.', 'rating' => 5],
                    ['quote' => 'Practical tools that work the same day I learned them.', 'authorName' => 'Adria N.', 'rating' => 5],
                    ['quote' => 'I wish I had this summit 10 years ago.', 'authorName' => 'Jane O.', 'rating' => 5],
                    ['quote' => 'The VIP pass was worth every penny.', 'authorName' => 'Han O.', 'rating' => 5],
                    ['quote' => "My teen and I are closer than we've ever been.", 'authorName' => 'Nancy P.', 'rating' => 5],
                ],
                'autoplay' => true,
                'intervalMs' => 6000,
            ]),
            $this->block('BonusStack', [
                'eyebrow' => 'BONUS MATERIALS',
                'headline' => 'Plus Instant Downloads Worth $64',
                'bonuses' => [
                    ['title' => 'Raising Children With ADHD Checklist', 'description' => 'Daily reset checklist.', 'valueLabel' => '($19 value)'],
                    ['title' => 'Swap Negative Reactions Guide', 'description' => 'Language reframes.', 'valueLabel' => '($27 value)'],
                    ['title' => 'Weekly Routine Chart', 'description' => 'Printable planner.', 'valueLabel' => '($9 value)'],
                    ['title' => 'School Schedule Template', 'description' => 'Teacher communication ready.', 'valueLabel' => '($9 value)'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
            ]),
            $this->block('WhyThisMattersStats', [
                'eyebrow' => 'Why now',
                'headline' => 'Why This Matters',
                'introText' => 'The data on ADHD — and why taking action now changes everything.',
                'stats' => [
                    ['iconName' => 'alert', 'bigText' => '#1', 'label' => 'ADHD is the most common childhood mental health condition.'],
                    ['iconName' => 'trending-down', 'bigText' => '60%', 'label' => 'of symptoms persist into adulthood without intervention.'],
                    ['iconName' => 'users', 'bigText' => '1 in 4', 'label' => 'chance at least one parent also has ADHD.'],
                    ['iconName' => 'heart-pulse', 'bigText' => '3x', 'label' => 'higher rates of anxiety & depression in untreated ADHD.'],
                    ['iconName' => 'pill', 'bigText' => '2x', 'label' => 'increased substance abuse risk in teens.'],
                    ['iconName' => 'book-x', 'bigText' => '30%', 'label' => 'academic performance gap vs. neurotypical peers.'],
                ],
            ]),
            $this->block('BenefitsGrid', [
                'headline' => 'Why Attend This Summit',
                'benefits' => [
                    ['iconName' => 'globe', 'title' => "World's Experts", 'description' => 'The most trusted names in ADHD research and parenting.'],
                    ['iconName' => 'clock', 'title' => 'Perfect Timing', 'description' => 'Before the summer, set up your family for success.'],
                    ['iconName' => 'check-circle', 'title' => 'Proven Path', 'description' => '253,788 families transformed with these strategies.'],
                    ['iconName' => 'sparkles', 'title' => 'Modern Insights', 'description' => 'Latest neuroscience research, not outdated advice.'],
                    ['iconName' => 'star', 'title' => 'Practical Advice', 'description' => 'Use-today tools, not theory.'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
            ]),
            $this->block('BenefitsWithImages', [
                'eyebrow' => 'What you\'ll walk away with',
                'headline' => 'Why YOU Need To Be Here',
                'benefits' => [
                    ['title' => "Unlock Your Child's True Potential", 'description' => "Stop managing — start thriving. See what's possible when ADHD becomes an advantage.", 'imageUrl' => 'https://placehold.co/800x600/5e4d9b/ffffff.png?text=Child+Potential'],
                    ['title' => 'Actionable Strategies For Tomorrow Morning', 'description' => 'No fluff. Every session gives you something you can try at breakfast.', 'imageUrl' => 'https://placehold.co/800x600/00b553/ffffff.png?text=Actionable'],
                ],
            ]),
            $this->block('NumberedReasons', [
                'eyebrow' => '5 reasons this is different',
                'headline' => '5 Reasons This Summit Is Different',
                'reasons' => [
                    ['title' => '5 full days of deep immersion', 'description' => 'Not a 90-minute webinar. Real depth.'],
                    ['title' => 'Reveal hidden potential', 'description' => 'See strengths the school system misses.'],
                    ['title' => 'Boundaries that actually hold', 'description' => 'Without yelling or shame.'],
                    ['title' => 'Teen motivation that works', 'description' => 'For kids you can\'t "make" do anything.'],
                    ['title' => 'Outburst de-escalation', 'description' => 'From chaos to calm in minutes, not hours.'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
            ]),
            $this->block('ClosingCTAWithList', [
                'eyebrow' => 'Last call',
                'headline' => 'Whatever Your Situation...',
                'bodyText' => 'All you need are ADHD-tailored parenting techniques.',
                'bullets' => ['Joy', 'Attention', 'Focus', 'Organization', 'Creativity', 'Success'],
                'ctaLabel' => 'GET INSTANT ACCESS',
                'ctaUrl' => '#register',
                'background' => 'gradient',
            ]),
            $this->block('FAQAccordion', [
                'headline' => 'Frequently Asked Questions',
                'items' => [
                    ['question' => 'When is the summit?', 'answer' => 'March 9–13, 2026, live and online. Replays available for 24 hours after each session.'],
                    ['question' => 'Is this available internationally?', 'answer' => 'Yes — parents from any country can attend. Sessions are in English.'],
                    ['question' => 'How long do I have to watch each session?', 'answer' => 'Each session is available free for 24 hours. VIP pass holders get lifetime access.'],
                    ['question' => 'Are sessions live or pre-recorded?', 'answer' => 'Speaker sessions are pre-recorded for quality; Q&A and bonus sessions are live.'],
                    ['question' => 'How many speakers per day?', 'answer' => 'Typically 6–8 speakers per day, ~20–30 minutes each.'],
                    ['question' => 'Where do I find the schedule?', 'answer' => "After registration you'll receive a full schedule with time zones."],
                    ['question' => 'What if I have technical issues?', 'answer' => 'Our support team responds within 4 hours via email.'],
                    ['question' => "What if I don't see the confirmation email?", 'answer' => 'Check spam, or email support@parenting-summits.com.'],
                    ['question' => "What's included in the VIP Pass?", 'answer' => 'Lifetime access, transcripts, bonus masterclasses, private community.'],
                    ['question' => 'Do you offer certificates of attendance?', 'answer' => 'Yes, VIP pass holders receive a downloadable certificate.'],
                ],
            ]),
            $this->block('OptinFormBlock', [
                'headline' => 'Secure Your Free Ticket',
                'subheadline' => 'Grab Your Seat Before It\'s Gone',
                'fields' => ['name' => true, 'email' => true],
                'submitLabel' => 'Secure My Free Ticket',
                'secondaryText' => 'Grab Your Seat Before It\'s Gone',
                'privacyText' => 'By registering you agree to receive summit updates and related offers. Unsubscribe anytime.',
                'backgroundStyle' => 'primary',
            ]),
            $this->block('Footer', [
                'tagline' => 'Strategic Parenting — Helping Families Thrive With ADHD',
                'links' => [
                    ['label' => 'Privacy Policy', 'url' => 'https://parenting-summits.com/privacy'],
                    ['label' => 'Cookies', 'url' => 'https://parenting-summits.com/cookies'],
                    ['label' => 'Terms and Conditions', 'url' => 'https://parenting-summits.com/terms'],
                ],
                'copyrightText' => '© 2026 Strategic Parenting. All rights reserved.',
                'summitDatesText' => 'Free Virtual Event · MARCH 9–13, 2026',
            ]),
        ];

        $step->update(['content' => $blocks]);

        $this->command?->info(sprintf('Seeded %d blocks into optin step (%s).', count($blocks), $step->slug));
    }

    private function block(string $type, array $props, int $version = 1): array
    {
        return [
            'id' => (string) Str::uuid(),
            'type' => $type,
            'version' => $version,
            'props' => $props,
        ];
    }
}
