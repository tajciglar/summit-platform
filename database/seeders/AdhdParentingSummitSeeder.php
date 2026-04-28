<?php

namespace Database\Seeders;

use App\Enums\LandingPageDraftStatus;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdhdParentingSummitSeeder extends Seeder
{
    public function run(): void
    {
        $domain = Domain::firstOrCreate(
            ['hostname' => 'parenting-summits.com'],
            [
                'name' => 'Parenting Summits',
                'slug' => 'parenting-summits',
                'brand_color' => '#4F46E5',
                'is_active' => true,
            ]
        );

        $summit = Summit::updateOrCreate(
            ['slug' => 'adhd-parenting-summit'],
            [
                'domain_id' => $domain->id,
                'title' => 'ADHD Parenting Summit',
                'topic' => 'ADHD parenting',
                'description' => 'A 5-day virtual summit for parents navigating ADHD.',
                'status' => 'published',
                'current_phase' => 'post',
                'pre_summit_starts_at' => '2025-02-03 00:00:00',
                'late_pre_summit_starts_at' => '2025-02-07 00:00:00',
                'during_summit_starts_at' => '2025-02-10 00:00:00',
                'post_summit_starts_at' => '2025-02-15 00:00:00',
                'ends_at' => '2025-03-15 00:00:00',
            ]
        );

        $admin = User::where('email', 'admin@example.test')->first();
        if ($admin) {
            $admin->domains()->syncWithoutDetaching([$domain->id]);
        }

        $speakerRows = [
            ['Stephen', 'Cowan', 'Holistic Pediatrician · NY Medical College', 'ADHD Finally Makes Sense Through The Five Phase Model', 0],
            ['Pippa', 'Simou', 'Coaching Psychologist · The ADD-vantage', 'Sometimes ADHD Is Quiet Girls Burning Out Trying to Be Perfect', 1],
            ['Peg', 'Dawson', 'Co-author Smart but Scattered · 475k copies sold', "What Shapes Kids Isn't Advice — It's How You Handle Your Urge to Control", 2],
            ['Richard', 'Guare', 'Neuropsychologist · Board-Certified Behavior Analyst', "Some Kids Don't Grow In Straight Lines", 3],
            ['Salif', 'Mahamane', 'TEDx Speaker · Psychology Professor', 'My ADHD Brain Pops Ideas Like Hot Popcorn', 4],
            ['Stephen P.', 'Hinshaw', 'Harvard-educated · Author of 11 books', "What Kind Of Parent Are You When No One's Watching?", 5],
            ['Kim', 'Van Dusen', "'The Parentologist' (125k) · Licensed Family Therapist", 'Why Parents Secretly Dread Playtime With ADHD Kids', 6],
            ['Andrea', 'Chronis-Tuscano', 'World-renowned ADHD Researcher · Endowed Prof U. Maryland', "A Mother's Mood Can Shape a Child's Mind More Than Any Diagnosis", 7],
        ];

        $speakers = collect();

        foreach ($speakerRows as [$first, $last, $title, $masterclass, $order]) {
            $slug = Str::slug("dr-{$first}-{$last}");

            $speaker = Speaker::updateOrCreate(
                ['slug' => $slug],
                [
                    'first_name' => $first,
                    'last_name' => $last,
                    'title' => $title,
                    'short_bio' => 'Expert in ADHD parenting and child development.',
                    'masterclass_title' => $masterclass,
                    'sort_order' => $order,
                    'is_featured' => $order < 3,
                    'free_access_window_hours' => 24,
                ]
            );

            $summit->speakers()->syncWithoutDetaching([
                $speaker->id => [
                    'day_number' => ($order % 5) + 1,
                    'sort_order' => $order,
                ],
            ]);

            $speakers->push($speaker);
        }

        $speakerIds = $speakers->pluck('id')->toArray();

        $vipPass = Product::updateOrCreate(
            ['slug' => 'vip-all-access-pass'],
            [
                'name' => 'VIP All-Access Pass',
                'category' => 'vip_pass',
                'tier' => 'vip',
                'grants_vip_access' => true,
                'description' => 'Unlimited lifetime access to all 40+ masterclass recordings, audio edition, transcripts, and exclusive bonuses.',
                'price_pre_summit_cents' => 9700,
                'price_late_pre_cents' => 14700,
                'price_during_cents' => 19700,
                'price_post_summit_cents' => 24700,
            ]
        );
        $vipPass->summits()->syncWithoutDetaching([$summit->id]);

        // --- Single funnel: optin + sales page ---
        // template_key + section_config on the funnel are what the template
        // family flow expects — one skin, distinct sections per step_type.
        $funnel = Funnel::updateOrCreate(
            ['summit_id' => $summit->id, 'slug' => 'aps-post'],
            [
                'name' => 'Post Main Funnel',
                'description' => 'Post-summit funnel: replay-access optin followed by VIP upgrade pitch.',
                'target_phase' => 'post',
                'is_active' => true,
                'wp_checkout_redirect_url' => 'https://althea-academy.com/checkout',
                'wp_thankyou_redirect_url' => 'https://althea-academy.com/thank-you',
                'template_key' => 'indigo-gold',
                'section_config' => [
                    'optin' => [
                        'top-bar', 'hero', 'press', 'trust-badges', 'stats', 'overview',
                        'speakers', 'outcomes', 'free-gift', 'founders', 'testimonials',
                        'bonuses', 'pull-quote', 'figures', 'shifts', 'closing-cta',
                        'faq', 'footer', 'sticky-mobile-cta',
                    ],
                    'sales_page' => [
                        'sales-hero', 'intro', 'vip-bonuses', 'free-gifts', 'upgrade-section',
                        'price-card', 'sales-speakers', 'comparison-table', 'guarantee', 'why-section',
                    ],
                    'thank_you' => [],
                ],
            ]
        );

        FunnelStep::updateOrCreate(
            ['funnel_id' => $funnel->id, 'slug' => 'optin'],
            [
                'step_type' => 'optin',
                'name' => 'Optin',
                'sort_order' => 0,
                'is_published' => true,
                'page_content' => $this->landingPageContent($speakerIds),
            ]
        );

        FunnelStep::updateOrCreate(
            ['funnel_id' => $funnel->id, 'slug' => 'vip-upgrade'],
            [
                'step_type' => 'sales_page',
                'name' => 'VIP Upgrade',
                'sort_order' => 1,
                'product_id' => $vipPass->id,
                'is_published' => true,
                'page_content' => $this->vipSalesPageContent(),
            ]
        );

        // --- Published drafts per step so each step's Preview button has a working token ---
        $stepDrafts = [
            ['step_type' => 'optin', 'payload' => $this->landingPageContent($speakerIds)],
            ['step_type' => 'sales_page', 'payload' => $this->vipSalesPageContent()],
        ];

        foreach ($stepDrafts as $entry) {
            /** @var FunnelStep $step */
            $step = $funnel->steps()->where('step_type', $entry['step_type'])->first();
            $payload = $entry['payload'];

            $batch = LandingPageBatch::firstOrCreate(
                ['funnel_id' => $funnel->id, 'funnel_step_id' => $step->id],
                [
                    'summit_id' => $summit->id,
                    'status' => 'completed',
                    'version_count' => 1,
                ]
            );

            LandingPageDraft::where('batch_id', $batch->id)
                ->where('status', LandingPageDraftStatus::Published)
                ->update(['status' => LandingPageDraftStatus::Archived]);

            LandingPageDraft::create([
                'batch_id' => $batch->id,
                'version_number' => 1,
                'template_key' => $payload['template_key'],
                'sections' => $payload['content'],
                'enabled_sections' => null,
                'status' => LandingPageDraftStatus::Published,
            ]);
        }

        $this->command?->info('ADHD Parenting Summit seeded (post phase).');
        $this->command?->info("Funnel ID: {$funnel->id}");
    }

    /** @param string[] $speakerIds */
    private function landingPageContent(array $speakerIds): array
    {
        return [
            'template_key' => 'indigo-gold',
            'content' => [
                'summit' => [
                    'name' => 'ADHD Parenting Summit',
                    'tagline' => 'Parenting you can rely on',
                    'startDate' => '2025-02-10',
                    'endDate' => '2025-02-14',
                ],
                'topBar' => ['name' => 'ADHD PARENTING SUMMIT'],
                'hero' => [
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
                    'outlets' => ['CNN', 'TIME', 'USA TODAY', 'The New York Times', 'TEDx', 'BBC', 'Forbes', 'Psychology Today', 'The Atlantic', 'Scientific American', 'The Guardian', 'HuffPost', 'CBS', 'The Washington Post'],
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
                        'A massive online event bringing together 40+ leading experts in ADHD, child development, and education — all focused on helping you parent with less stress and more connection.',
                        "Over 5 days, you'll find evidence-based strategies from neuropsychologists, family therapists, and parents who've been where you are. Watch the replays on demand at your own pace.",
                    ],
                    'ctaLabel' => 'Get Replay Access',
                    'cardHeadline' => '5 Days. 40+ Experts. On Demand.',
                    'cardSubhead' => 'Watch all replays at your own pace',
                ],
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
                    'body' => 'A curated bundle of guides, checklists, and scripts designed by our expert speakers — yours free with your VIP Pass.',
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
                        [
                            'valueLabel' => '$97 VALUE',
                            'title' => 'The ADHD Morning Playbook',
                            'description' => 'A 7-day system for transforming chaotic mornings into calm, connected starts to the day.',
                            'bullets' => ['Visual schedule templates', 'Transition scripts that work', 'Calm-down toolkit'],
                        ],
                        [
                            'valueLabel' => '$97 VALUE',
                            'title' => 'Meltdown to Breakthrough Guide',
                            'description' => 'Step-by-step de-escalation framework that transforms emotional outbursts into growth moments.',
                            'bullets' => ['5-step de-escalation method', 'Emotional coaching scripts', 'Printable calm-down cards'],
                        ],
                        [
                            'valueLabel' => '$97 VALUE',
                            'title' => 'School Advocacy Toolkit',
                            'description' => 'Everything you need to get your child the support they deserve at school.',
                            'bullets' => ['IEP/504 request templates', 'Teacher communication scripts', 'Accommodation checklists'],
                        ],
                    ],
                    'ctaLabel' => 'Get Replay Access + All Bonuses',
                ],
                'founders' => [
                    'headline' => 'From the Founders',
                    'items' => [
                        ['name' => 'Roman Wiltman', 'role' => 'Co-Founder', 'quote' => 'Our journey started when our son was diagnosed at age 6. We felt lost, overwhelmed, and alone. This summit exists so no parent has to feel that way again.', 'initials' => 'RW'],
                        ['name' => 'Anisah Semen', 'role' => 'Co-Founder', 'quote' => 'Every child with ADHD has incredible strengths waiting to be unlocked. Our mission is to help parents see those strengths — and nurture them.', 'initials' => 'AS'],
                    ],
                ],
                'testimonials' => [
                    'eyebrow' => 'What Parents Say',
                    'headline' => '73,124 Parents. One Common Theme.',
                    'items' => [
                        ['quote' => 'This summit was life-changing. The expert sessions gave me tools I use every single day. My relationship with my son has completely transformed.', 'name' => 'Rachel Berman', 'location' => 'Ohio, USA', 'initials' => 'RB'],
                        ['quote' => "Finally someone who understands. The strategies are practical, not theoretical. My daughter's mornings are so much calmer now.", 'name' => 'Kamila Bosco', 'location' => 'London, UK', 'initials' => 'KB'],
                        ['quote' => "My husband and I watched together. For the first time we're on the same page about how to support our ADHD child.", 'name' => 'Jennifer Mitchell', 'location' => 'Toronto, CA', 'initials' => 'JM'],
                    ],
                ],
                'pullQuote' => [
                    'quote' => 'The earlier you learn how to support your child with ADHD, the better your chances of managing their condition and minimizing long-term challenges.',
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
                        ['title' => 'From Punishment to Partnership', 'description' => 'Move beyond punishment-based parenting to an evidence-backed approach that builds cooperation naturally, without bribes or threats.'],
                        ['title' => 'From Frustration to Understanding', 'description' => "Understand the neuroscience behind ADHD behavior — knowledge that shifts your perspective from \"why won't they listen?\" to \"how can I help?\""],
                        ['title' => 'From Chaos to Calm Mornings', 'description' => 'Implement structured routines that reduce daily friction and create predictable, stress-free transitions throughout the day.'],
                        ['title' => 'From Isolation to Community', 'description' => 'Connect with thousands of parents who truly understand your experience — no judgement, just support and practical advice.'],
                        ['title' => 'From Surviving to Thriving', 'description' => "Discover your child's unique ADHD strengths and learn how to nurture them — turning challenges into superpowers."],
                    ],
                ],
                'closing' => [
                    'headline' => 'Your Replay Access Is Waiting',
                    'chips' => ['40+ expert sessions', 'On-demand access', 'Lifetime replays', 'Expert audio edition', '$291 in free bonuses', '14-day guarantee'],
                    'ctaLabel' => 'GET INSTANT REPLAY ACCESS →',
                ],
                'faqSection' => [
                    'eyebrow' => 'Common Questions',
                    'headline' => 'Frequently Asked Questions',
                ],
                'faqs' => [
                    ['question' => 'Can I still watch the summit?', 'answer' => 'Yes! The VIP All-Access Pass gives you unlimited lifetime access to all 40+ sessions. Watch them on demand, at your own pace.'],
                    ['question' => 'What is included in the VIP Pass?', 'answer' => 'Unlimited lifetime access to all recordings, audio edition, English subtitles, transcripts, Expert Action Blueprints, Summit Workbook, and 4 exclusive bonus gifts.'],
                    ['question' => 'Is there a money-back guarantee?', 'answer' => "Absolutely. You have a full 14-day money-back guarantee. If you're not satisfied, simply email us and we'll refund your investment in full."],
                    ['question' => 'Is this only for parents of diagnosed children?', 'answer' => 'Not at all. Whether your child has a formal diagnosis, is in the assessment process, or you simply suspect ADHD, these strategies will help.'],
                    ['question' => 'How do I access the recordings?', 'answer' => "Immediately after purchase, you'll receive an email with access details. All sessions are available in your personal members area."],
                    ['question' => 'What if I only have time to watch some sessions?', 'answer' => "That's completely fine! Lifetime access means you can watch at your own pace. Each session is valuable on its own."],
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
            ],
        ];
    }

    private function vipSalesPageContent(): array
    {
        return [
            'template_key' => 'indigo-gold',
            'content' => [
                'topBar' => [
                    'name' => 'ADHD Parenting Summit',
                ],
                'salesHero' => [
                    'badge' => 'Special One-Time Offer',
                    'headline' => 'You Can Keep The Invaluable Lessons From All 40+ Summit Experts FOREVER',
                    'subheadline' => 'Watch or re-watch at your own pace, listen on the go, or just read the summaries with your own VIP Pass.',
                    'productLabel' => 'VIP Pass',
                    'totalValue' => '$1,117',
                    'ctaLabel' => 'Upgrade Now — Only $147',
                    'ctaNote' => 'This offer is ONLY available on this page. 14-day money-back guarantee.',
                ],
                'intro' => [
                    'eyebrow' => 'The VIP Pass Is…',
                    'headline' => 'Your ADHD Parenting Guide',
                    'paragraphs' => [
                        "With the exclusive VIP Pass, you'll dive into the content on your own schedule, listen to it on the go, and stay committed to taking action.",
                        'Or even learn the key lessons in minutes by just skimming through the session summaries.',
                    ],
                ],
                'vipBonuses' => [
                    'eyebrow' => "Here's Everything You're Getting With",
                    'headline' => 'The VIP Pass',
                    'items' => [
                        ['icon' => 'infinity', 'title' => 'Unlimited Lifetime Access', 'description' => 'Each summit day is only streaming for 24 hours. But you can get the entire 5-day summit with 40+ masterclasses available for unlimited viewing.', 'valueLabel' => 'Value: $490'],
                        ['icon' => 'clipboard', 'title' => 'Expert Action Blueprint for Each Masterclass', 'description' => 'A one-page snapshot of each masterclass — key takeaways and action steps. Print them out or scroll through on your phone.', 'valueLabel' => 'Value: $75'],
                        ['icon' => 'headphones', 'title' => '"On The Go" Audio Edition', 'description' => 'Downloadable audio recordings of all 40+ full-length interviews. Listen while working out or doing chores.', 'valueLabel' => 'Value: $240'],
                        ['icon' => 'captions', 'title' => 'English Subtitles', 'description' => 'Turn on the subtitles and follow along easily, even if English is not your first language.', 'valueLabel' => 'Value: $45'],
                        ['icon' => 'file-text', 'title' => 'Transcript of Each Masterclass', 'description' => 'Skim through for the bits you need most, revisit advice without rewinding, and find the words that resonate instantly.', 'valueLabel' => 'Value: $75'],
                        ['icon' => 'book', 'title' => 'Summit Workbook', 'description' => "Don't just learn — act! Apply your new knowledge with the support and guidance of this beautiful workbook. Make a plan, take action, observe the transformation.", 'valueLabel' => 'Value: $45'],
                    ],
                ],
                'freeGifts' => [
                    'eyebrow' => 'Plus Four Free Gifts',
                    'headline' => 'To Make Your ADHD Parenting Easier TODAY',
                    'items' => [
                        ['giftNumber' => 1, 'title' => 'Summit Digest Emails', 'description' => 'Bite-sized emails that break down summit content for brains that get overwhelmed by 8-hour learning days.', 'valueLabel' => 'Value: $49'],
                        ['giftNumber' => 2, 'title' => 'Same-Page Parenting Style Guidebook', 'description' => 'Align with your partner and other family members on your ADHD parenting approach.', 'valueLabel' => 'Value: $49'],
                        ['giftNumber' => 3, 'title' => 'Reclaim Your Time Guidebook', 'description' => '50 practical, time-saving hacks for busy parents to reclaim up to 14 hours of time per week.', 'valueLabel' => 'Value: $49'],
                        ['giftNumber' => 4, 'title' => "The Parent's Pocket-Saving Hacks", 'description' => '50 simple tips & tricks to help you save at least $100 every month.', 'valueLabel' => 'Value: $49'],
                    ],
                    'deliveryNote' => 'All gifts delivered to your email immediately after purchase.',
                ],
                'upgradeSection' => [
                    'eyebrow' => 'Upgrade To The VIP Pass',
                    'headline' => 'Today',
                    'paragraphs' => [
                        'Imagine having a comprehensive library of expert ADHD parenting advice at your fingertips, ready whenever you need it.',
                        "That's exactly what our VIP Pass offers.",
                        "It's not just about attending The Summit… it's about applying the information in your home.",
                        'The lifetime access and all the tools included will help you absorb and apply every insight the experts share with you.',
                        "Whether that's diving deep into transcripts at 11 PM when your kids are asleep, or listening to audio while commuting — when you invest in your $147 VIP Pass, you give yourself permission to learn and implement at your own pace.",
                    ],
                ],
                'priceCard' => [
                    'badge' => '★ Save 77% — One-Time Offer',
                    'headline' => 'Upgrade to the VIP Pass today',
                    'note' => "You won't see this offer again.",
                    'features' => [
                        'Unlimited Lifetime Access to the 5-day summit & 40+ masterclasses',
                        '"On The Go" audio edition — listen while working out or doing chores',
                        "English Subtitles — follow along easily, even if English isn't your first language",
                        'Transcripts of each masterclass — skim for the bits you need',
                        'Expert Action Blueprint — key takeaways & action steps',
                        'Summit Workbook — make a plan, take action, see the transformation',
                        '14-Day Money-Back Guarantee — risk-free',
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
                    'guarantee' => '14-day money-back guarantee · Secure checkout',
                ],
                'salesSpeakers' => [
                    'eyebrow' => 'Learn From These',
                    'headline' => '40+ World-Leading Experts and Authorities',
                ],
                'comparisonTable' => [
                    'eyebrow' => "Here's Everything You're Getting",
                    'headline' => 'When You Upgrade Today',
                    'rows' => [
                        ['label' => '24-hour access to all 5 Summit days (40+ masterclasses)', 'freePass' => true, 'vipPass' => true],
                        ['label' => 'Free Sign-Up Gift', 'freePass' => true, 'vipPass' => true],
                        ['label' => 'Unlimited lifetime access to 40+ masterclass recordings', 'freePass' => false, 'vipPass' => true],
                        ['label' => '"On The Go" audio edition of the entire summit', 'freePass' => false, 'vipPass' => true],
                        ['label' => 'English subtitles for 40+ masterclasses', 'freePass' => false, 'vipPass' => true],
                        ['label' => 'Transcript of each masterclass', 'freePass' => false, 'vipPass' => true],
                        ['label' => 'Expert Action Blueprint of each masterclass', 'freePass' => false, 'vipPass' => true],
                        ['label' => 'Summit Workbook', 'freePass' => false, 'vipPass' => true],
                        ['label' => '4 VIP bonuses', 'freePass' => false, 'vipPass' => true],
                    ],
                ],
                'guarantee' => [
                    'heading' => 'One single payment, backed by a full 14-day money-back guarantee',
                    'body' => "If the VIP Pass doesn't absolutely exceed your expectations, send us an email and we'll return your full investment — no questions asked.",
                    'days' => 14,
                ],
                'whySection' => [
                    'headline' => 'Why Are We Offering This?',
                    'subheadline' => '(and for only $147!)',
                    'paragraphs' => [
                        "We designed this Summit with a deep understanding of how wonderfully unique your child's ADHD brain is.",
                        'The insights shared during these five days are too valuable to be experienced just once or to disappear after 24 hours.',
                        "These are strategies that can genuinely transform your relationship with your child — strategies you'll want to revisit as your child grows.",
                        'We created the VIP Pass because we believe everyone deserves the chance to absorb this life-changing information in a way that honors their natural learning style and pace.',
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
            ],
        ];
    }
}
