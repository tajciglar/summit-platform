<?php

namespace App\Services\Templates;

use App\Models\Speaker;

/**
 * Canonical starter content for the two golden templates we ship:
 *   - aps-parenting (optin / landing) → indigo-gold renderer (optin sections)
 *   - aps-vip (upsell / sales) → indigo-gold renderer (sales sections)
 *
 * Both keys route through the same `indigo-gold` template family; the step
 * picks its layout by enabling the optin- or sales-style sections.
 *
 * Used to seed FunnelStep.page_content with every section pre-filled so the
 * operator sees a full editable Builder on first open. Speaker UUIDs are
 * resolved at call time from the step's summit so the content is valid across
 * environments.
 */
class GoldenTemplates
{
    public const OPTIN_KEY = 'aps-parenting';

    public const VIP_KEY = 'aps-vip';

    /** step_type → golden key */
    public static function keyForStepType(string $stepType): ?string
    {
        return match ($stepType) {
            'optin' => self::OPTIN_KEY,
            'sales_page', 'upsell', 'downsell' => self::VIP_KEY,
            default => null,
        };
    }

    /**
     * @return array{template_key: string, content: array<string, mixed>}
     */
    public static function contentFor(string $goldenKey, ?string $summitId): array
    {
        return match ($goldenKey) {
            self::OPTIN_KEY => [
                'template_key' => 'indigo-gold',
                'content' => self::optinContent(
                    self::speakerIds($summitId),
                    self::dayNumbers($summitId),
                ),
            ],
            self::VIP_KEY => [
                'template_key' => 'indigo-gold',
                'content' => self::vipContent(),
            ],
            default => throw new \InvalidArgumentException("Unknown golden template: {$goldenKey}"),
        };
    }

    /** @return list<string> */
    private static function speakerIds(?string $summitId): array
    {
        if ($summitId === null) {
            return [];
        }

        return Speaker::query()
            ->where('summit_id', $summitId)
            ->orderBy('sort_order')
            ->pluck('id')
            ->all();
    }

    /**
     * Distinct day numbers assigned to this summit's speakers (sorted
     * ascending, nulls excluded). Drives how many `speakersByDay` entries
     * we seed into a fresh funnel — one per real day, or a single DAY 1
     * stub when the summit has no speakers yet.
     *
     * @return list<int>
     */
    private static function dayNumbers(?string $summitId): array
    {
        if ($summitId === null) {
            return [];
        }

        return Speaker::query()
            ->where('summit_id', $summitId)
            ->whereNotNull('day_number')
            ->distinct()
            ->orderBy('day_number')
            ->pluck('day_number')
            ->map(fn ($n) => (int) $n)
            ->all();
    }

    /**
     * Seed `speakersByDay` entries — one per distinct day_number on the
     * summit's speakers. The renderer later filters the summit's full
     * speaker list by `dayNumber` at render time, so adding a speaker with
     * `day_number=3` later automatically populates the DAY 3 block as long
     * as the operator has configured a DAY 3 entry here. When the summit
     * has no speakers yet we seed a single DAY 1 stub — the renderer shows
     * placeholder cards under it until real speakers arrive.
     *
     * @param  list<int>  $dayNumbers
     * @return list<array{dayNumber: int, dayLabel: string, headline: string}>
     */
    private static function speakersByDayEntries(array $dayNumbers): array
    {
        if ($dayNumbers === []) {
            return [[
                'dayNumber' => 1,
                'dayLabel' => 'DAY 1',
                'headline' => "Understanding Your Child's Brain",
            ]];
        }

        return array_map(
            static fn (int $n): array => [
                'dayNumber' => $n,
                'dayLabel' => "DAY {$n}",
                'headline' => "Day {$n} Sessions",
            ],
            $dayNumbers,
        );
    }

    /**
     * @param  list<string>  $speakerIds
     * @param  list<int>  $dayNumbers  distinct summit day_numbers; empty = single DAY 1 stub
     */
    private static function optinContent(array $speakerIds, array $dayNumbers = []): array
    {
        return [
            'summit' => [
                'name' => 'ADHD Parenting Summit',
                'tagline' => 'Parenting you can rely on',
                'startDate' => '2025-02-10',
                'endDate' => '2025-02-14',
                'timezone' => 'America/New_York',
            ],
            'topBar' => ['name' => 'ADHD PARENTING SUMMIT'],
            'hero' => [
                'eventStatus' => 'ended',
                'dateRangeLabel' => 'Feb 10–14, 2025',
                'endedLabel' => 'Summit Has Ended',
                'liveLabel' => 'Summit Now Live',
                'eyebrow' => 'The Summit Has Ended — But The Learning Continues:',
                'headline' => 'Watch All 40+ Expert Sessions On Demand At The ADHD Parenting Summit',
                'subheadlineLead' => '40+ Leading Experts',
                'subheadlineTrail' => ' On Improving Focus, Managing Emotions, Handling Outbursts, Screen Management, And Schoolwork.',
                'ctaLabel' => 'Get Instant Replay Access →',
                'giftNoteLead' => 'Order now and receive a ',
                'giftNoteAccent' => 'FREE GIFT',
                'giftNoteTrail' => ': The ADHD Parenting Mastery Collection',
                'ratingLead' => 'Trusted by ',
                'ratingCount' => '73,124',
                'ratingTrail' => ' committed parents',
                'collageSpeakerIds' => array_slice($speakerIds, 0, 6),
            ],
            'press' => [
                'eyebrow' => 'Our Speakers Have Been Featured In',
                'outlets' => ['CNN', 'TIME', 'USA TODAY', 'The New York Times', 'TEDx', 'BBC', 'Forbes', 'Psychology Today'],
            ],
            'trustBadges' => [
                'items' => [
                    ['label' => 'Instant Replay Access', 'icon' => 'shield'],
                    ['label' => 'Secure Checkout', 'icon' => 'lock'],
                    ['label' => '14-Day Guarantee', 'icon' => 'info'],
                    ['label' => '73,124+ Parents', 'icon' => 'star'],
                ],
            ],
            'stats' => [
                'items' => [
                    ['value' => '5', 'label' => 'Days of Expert Sessions'],
                    ['value' => '40+', 'label' => 'World-Class Speakers'],
                    ['value' => '50,000+', 'label' => 'Parents Attended'],
                ],
            ],
            'overview' => [
                'eyebrow' => 'What Is This?',
                'headline' => 'What is the ADHD Parenting Summit?',
                'bodyParagraphs' => [
                    'A massive online event bringing together 40+ leading experts in ADHD, child development, and education.',
                    "Over 5 days, you'll find evidence-based strategies. Watch the replays on demand at your own pace.",
                ],
                'ctaLabel' => 'Get Replay Access',
                'cardHeadline' => '5 Days. 40+ Experts. On Demand.',
                'cardSubhead' => 'Watch all replays at your own pace',
            ],
            'speakersByDay' => self::speakersByDayEntries($dayNumbers),
            'outcomes' => [
                'eyebrow' => "What You'll Walk Away With",
                'headline' => 'Six Transformations By The End Of Day 5',
                'items' => [
                    ['title' => 'Understand Why They Act Out', 'description' => 'See the neuroscience behind the behavior', 'icon' => 'brain', 'tone' => 'brand'],
                    ['title' => 'End the Yelling Cycle', 'description' => 'Calm responses that actually work', 'icon' => 'chat', 'tone' => 'brand'],
                    ['title' => 'Fix Morning Chaos', 'description' => 'Routines that reduce daily friction', 'icon' => 'clock', 'tone' => 'brand'],
                    ['title' => 'Build Emotional Resilience', 'description' => 'Help your child regulate big emotions', 'icon' => 'heart', 'tone' => 'gold'],
                    ['title' => 'Navigate School Systems', 'description' => 'IEPs, 504s, and teacher communication', 'icon' => 'school', 'tone' => 'gold'],
                    ['title' => 'Connect With Other Parents', 'description' => 'You are not alone in this journey', 'icon' => 'users', 'tone' => 'gold'],
                ],
            ],
            'freeGift' => [
                'eyebrow' => 'Order Now & Get This Free',
                'headline' => 'The ADHD Parenting Mastery Collection',
                'body' => 'A curated bundle of guides, checklists, and scripts designed by our expert speakers.',
                'bullets' => [
                    'Morning routine visual schedule templates',
                    'De-escalation scripts for meltdowns',
                    'IEP/504 accommodation request templates',
                    'Printable calm-down card set',
                ],
                'ctaLabel' => 'Get Replay Access + Free Gift →',
                'badgeLabel' => 'FREE GIFT',
                'cardTitle' => 'The ADHD Parenting Mastery Collection',
                'cardNote' => 'FREE with VIP Pass',
            ],
            'bonuses' => [
                'eyebrow' => 'Plus Free Bonuses',
                'headline' => 'Three Bonuses Worth $291 — Included Free',
                'items' => [
                    ['valueLabel' => '$97 VALUE', 'title' => 'The ADHD Morning Playbook', 'description' => 'A 7-day system for transforming chaotic mornings.', 'bullets' => ['Visual schedule templates', 'Transition scripts that work']],
                    ['valueLabel' => '$97 VALUE', 'title' => 'Meltdown to Breakthrough Guide', 'description' => 'Step-by-step de-escalation framework.', 'bullets' => ['5-step de-escalation method', 'Emotional coaching scripts']],
                    ['valueLabel' => '$97 VALUE', 'title' => 'School Advocacy Toolkit', 'description' => 'Everything you need to get support at school.', 'bullets' => ['IEP/504 request templates', 'Teacher communication scripts']],
                ],
                'ctaLabel' => 'Get Replay Access + All Bonuses',
            ],
            'founders' => [
                'headline' => 'From the Founders',
                'items' => [
                    ['name' => 'Roman Wiltman', 'role' => 'Co-Founder', 'quote' => 'Our journey started when our son was diagnosed at age 6.', 'initials' => 'RW'],
                    ['name' => 'Anisah Semen', 'role' => 'Co-Founder', 'quote' => 'Every child with ADHD has incredible strengths waiting to be unlocked.', 'initials' => 'AS'],
                ],
            ],
            'testimonials' => [
                'eyebrow' => 'What Parents Say',
                'headline' => '73,124 Parents. One Common Theme.',
                'items' => [
                    ['quote' => 'This summit was life-changing.', 'name' => 'Rachel Berman', 'location' => 'Ohio, USA', 'initials' => 'RB'],
                    ['quote' => 'Finally someone who understands.', 'name' => 'Kamila Bosco', 'location' => 'London, UK', 'initials' => 'KB'],
                    ['quote' => 'My husband and I watched together.', 'name' => 'Jennifer Mitchell', 'location' => 'Toronto, CA', 'initials' => 'JM'],
                ],
            ],
            'pullQuote' => [
                'quote' => 'The earlier you learn how to support your child with ADHD, the better.',
                'attribution' => '— Dr. Sarah Jensen, Pediatric Neuropsychologist',
            ],
            'figures' => [
                'eyebrow' => 'Why This Matters',
                'headline' => 'The Reality of ADHD in Families Today',
                'items' => [
                    ['value' => '1 in 9', 'description' => 'Children diagnosed with ADHD in the US'],
                    ['value' => '74%', 'description' => 'Parents feel isolated and unsupported'],
                    ['value' => '3.2x', 'description' => 'Higher stress levels in ADHD families'],
                    ['value' => '15+', 'description' => 'Years of clinical research represented'],
                    ['value' => '28%', 'description' => 'School-age children struggle academically'],
                    ['value' => '93%', 'description' => 'Of past attendees recommend this summit'],
                ],
            ],
            'shifts' => [
                'eyebrow' => 'Five Big Shifts',
                'headline' => 'What Changes By Day 5',
                'items' => [
                    ['title' => 'From Punishment to Partnership', 'description' => 'Move beyond punishment-based parenting.'],
                    ['title' => 'From Frustration to Understanding', 'description' => 'Understand the neuroscience behind ADHD.'],
                    ['title' => 'From Chaos to Calm Mornings', 'description' => 'Implement structured routines.'],
                    ['title' => 'From Isolation to Community', 'description' => 'Connect with thousands of parents.'],
                    ['title' => 'From Surviving to Thriving', 'description' => "Discover your child's unique strengths."],
                ],
            ],
            'closing' => [
                'headline' => 'Your Replay Access Is Waiting',
                'chips' => ['40+ expert sessions', 'On-demand access', 'Lifetime replays', '14-day guarantee'],
                'ctaLabel' => 'GET INSTANT REPLAY ACCESS →',
            ],
            'faqSection' => [
                'eyebrow' => 'Common Questions',
                'headline' => 'Frequently Asked Questions',
            ],
            'faqs' => [
                ['question' => 'Can I still watch the summit?', 'answer' => 'Yes! The VIP All-Access Pass gives you unlimited lifetime access.'],
                ['question' => 'What is included in the VIP Pass?', 'answer' => 'Unlimited lifetime access to all recordings, audio, transcripts, and bonuses.'],
                ['question' => 'Is there a money-back guarantee?', 'answer' => 'A full 14-day money-back guarantee, no questions asked.'],
                ['question' => 'Is this only for parents of diagnosed children?', 'answer' => 'Not at all — all parents welcome.'],
            ],
            'mobileCta' => ['ctaLabel' => 'Get Instant Replay Access →'],
            'footer' => [
                'brandName' => 'ADHD Parenting Summit',
                'tagline' => 'Parenting you can rely on',
                'brandInitial' => 'A',
                'links' => [
                    ['label' => 'Privacy', 'href' => '/privacy'],
                    ['label' => 'Terms', 'href' => '/terms'],
                    ['label' => 'Contact', 'href' => '/contact'],
                ],
                'copyright' => '© 2025 Parenting Summits. All rights reserved.',
            ],
        ];
    }

    private static function vipContent(): array
    {
        return [
            'topBar' => ['name' => 'ADHD Parenting Summit'],
            'salesHero' => [
                'badge' => 'Special One-Time Offer',
                'headline' => 'You Can Keep The Invaluable Lessons From All 40+ Summit Experts FOREVER',
                'subheadline' => 'Watch or re-watch at your own pace with your own VIP Pass.',
                'productLabel' => 'VIP Pass',
                'totalValue' => '$1,117',
                'ctaLabel' => 'Upgrade Now — Only $147',
                'ctaNote' => '14-day money-back guarantee.',
            ],
            'intro' => [
                'eyebrow' => 'The VIP Pass Is…',
                'headline' => 'Your ADHD Parenting Guide',
                'paragraphs' => [
                    "With the exclusive VIP Pass, you'll dive into the content on your own schedule.",
                    'Or even learn the key lessons in minutes by just skimming through the session summaries.',
                ],
            ],
            'vipBonuses' => [
                'eyebrow' => "Here's Everything You're Getting With",
                'headline' => 'The VIP Pass',
                'items' => [
                    ['icon' => 'infinity', 'title' => 'Unlimited Lifetime Access', 'description' => 'Get the entire 5-day summit for unlimited viewing.', 'valueLabel' => 'Value: $490'],
                    ['icon' => 'clipboard', 'title' => 'Expert Action Blueprint', 'description' => 'A one-page snapshot of each masterclass.', 'valueLabel' => 'Value: $75'],
                    ['icon' => 'headphones', 'title' => '"On The Go" Audio Edition', 'description' => 'Downloadable audio for all 40+ interviews.', 'valueLabel' => 'Value: $240'],
                    ['icon' => 'captions', 'title' => 'English Subtitles', 'description' => 'Follow along easily.', 'valueLabel' => 'Value: $45'],
                    ['icon' => 'file-text', 'title' => 'Transcript of Each Masterclass', 'description' => 'Skim for the bits you need most.', 'valueLabel' => 'Value: $75'],
                    ['icon' => 'book', 'title' => 'Summit Workbook', 'description' => "Don't just learn — act!", 'valueLabel' => 'Value: $45'],
                ],
            ],
            'freeGifts' => [
                'eyebrow' => 'Plus Four Free Gifts',
                'headline' => 'To Make Your ADHD Parenting Easier TODAY',
                'items' => [
                    ['giftNumber' => 1, 'title' => 'Summit Digest Emails', 'description' => 'Bite-sized emails breaking down summit content.', 'valueLabel' => 'Value: $49'],
                    ['giftNumber' => 2, 'title' => 'Same-Page Parenting Style Guidebook', 'description' => 'Align with your partner on approach.', 'valueLabel' => 'Value: $49'],
                    ['giftNumber' => 3, 'title' => 'Reclaim Your Time Guidebook', 'description' => '50 practical time-saving hacks.', 'valueLabel' => 'Value: $49'],
                    ['giftNumber' => 4, 'title' => "The Parent's Pocket-Saving Hacks", 'description' => '50 tips to save $100 every month.', 'valueLabel' => 'Value: $49'],
                ],
                'deliveryNote' => 'All gifts delivered to your email immediately.',
            ],
            'upgradeSection' => [
                'eyebrow' => 'Upgrade To The VIP Pass',
                'headline' => 'Today',
                'paragraphs' => [
                    'Imagine having a comprehensive library of expert ADHD parenting advice at your fingertips.',
                    "That's exactly what our VIP Pass offers.",
                ],
            ],
            'priceCard' => [
                'badge' => '★ Save 77% — One-Time Offer',
                'headline' => 'Upgrade to the VIP Pass today',
                'note' => "You won't see this offer again.",
                'features' => [
                    'Unlimited Lifetime Access to 40+ masterclasses',
                    '"On The Go" audio edition',
                    'English Subtitles',
                    'Transcripts of each masterclass',
                    'Expert Action Blueprint',
                    'Summit Workbook',
                    '14-Day Money-Back Guarantee',
                ],
                'giftsBoxTitle' => 'Plus 4 Free Gifts',
                'giftItems' => [
                    'Gift 1: Summit Digest Emails',
                    'Gift 2: Same-Page Parenting Style Guidebook',
                    'Gift 3: Reclaim Your Time Guidebook',
                    "Gift 4: Parent's Pocket-Saving Hacks",
                ],
                'totalValue' => '$1,117',
                'regularPrice' => '$197',
                'currentPrice' => '$147',
                'savings' => 'Save $50',
                'ctaLabel' => 'Upgrade to VIP Now',
                'guarantee' => '14-day money-back guarantee',
            ],
            'salesSpeakers' => [
                'eyebrow' => 'Learn From These',
                'headline' => '40+ World-Leading Experts',
            ],
            'comparisonTable' => [
                'eyebrow' => "Here's Everything You're Getting",
                'headline' => 'When You Upgrade Today',
                'rows' => [
                    ['label' => '24-hour access to all 5 Summit days', 'freePass' => true, 'vipPass' => true],
                    ['label' => 'Free Sign-Up Gift', 'freePass' => true, 'vipPass' => true],
                    ['label' => 'Unlimited lifetime access', 'freePass' => false, 'vipPass' => true],
                    ['label' => '"On The Go" audio edition', 'freePass' => false, 'vipPass' => true],
                    ['label' => 'English subtitles', 'freePass' => false, 'vipPass' => true],
                    ['label' => 'Transcript of each masterclass', 'freePass' => false, 'vipPass' => true],
                    ['label' => 'Expert Action Blueprint', 'freePass' => false, 'vipPass' => true],
                    ['label' => 'Summit Workbook', 'freePass' => false, 'vipPass' => true],
                    ['label' => '4 VIP bonuses', 'freePass' => false, 'vipPass' => true],
                ],
            ],
            'guarantee' => [
                'heading' => 'One single payment, backed by a full 14-day money-back guarantee',
                'body' => "If the VIP Pass doesn't exceed your expectations, send us an email and we'll refund you — no questions asked.",
                'days' => 14,
            ],
            'whySection' => [
                'headline' => 'Why Are We Offering This?',
                'subheadline' => '(and for only $147!)',
                'paragraphs' => [
                    "We designed this Summit with a deep understanding of how wonderfully unique your child's ADHD brain is.",
                    'The insights are too valuable to disappear after 24 hours.',
                ],
            ],
            'footer' => [
                'brandName' => 'StrategicParenting ADHD',
                'tagline' => 'Parenting you can rely on',
                'brandInitial' => 'S',
                'links' => [
                    ['label' => 'Privacy policy', 'href' => '/privacy'],
                    ['label' => 'Cookies', 'href' => '/cookies'],
                    ['label' => 'Terms and Conditions', 'href' => '/terms'],
                ],
                'copyright' => '© 2025 Parenting Summits. All rights reserved.',
            ],
        ];
    }
}
