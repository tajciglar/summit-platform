<?php

namespace Database\Seeders;

use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FunnelContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDomain('Parenting Summits', 'adhd-parenting-summit-2026', [
            ['indigo-gold', true, 'Main Optin Funnel', 'main-optin', 'pre'],
            ['blue-coral', false, 'Blue Coral Variant', 'blue-coral-variant', 'pre'],
            ['ochre-ink', false, 'Editorial Variant', 'editorial-variant', 'post'],
        ]);

        $this->seedDomain('Vzgoja', 'productivity-summit-2026', [
            ['green-gold', true, 'Main Green Gold Funnel', 'main-green-gold', 'pre'],
            ['lime-ink', false, 'Lime Ink Variant', 'lime-ink-variant', 'during'],
            ['violet-sun', false, 'Violet Sun Variant', 'violet-sun-variant', 'post'],
        ]);

        $this->seedDomain('Althea Academy', null, [
            ['cream-sage', true, 'Cream Sage Funnel', 'cream-sage-main', 'pre'],
            ['rust-cream', false, 'Rust Cream Variant', 'rust-cream-variant', 'late_pre'],
            ['indigo-gold', false, 'Indigo Gold Variant', 'indigo-gold-variant', 'post'],
        ], [
            'title' => "Women's Health & Longevity Summit 2026",
            'slug' => 'womens-health-longevity-2026',
            'topic' => "women's health and longevity",
        ]);

        $this->seedDomain('Haley, Bahringer and Homenick', null, [
            ['blue-coral', true, 'Blue Coral Main', 'blue-coral-main', 'pre'],
            ['lime-ink', false, 'Lime System Draft', 'lime-system-draft', 'during'],
            ['ochre-ink', false, 'Editorial Draft', 'ochre-editorial-draft', 'post'],
        ], [
            'title' => 'Future of AI & Business Summit 2026',
            'slug' => 'ai-business-summit-2026',
            'topic' => 'AI and business innovation',
        ]);
    }

    private function seedDomain(string $domainName, ?string $existingSummitSlug, array $funnelSpecs, ?array $newSummitData = null): void
    {
        $domain = Domain::where('name', $domainName)->firstOrFail();

        if ($existingSummitSlug) {
            $summit = Summit::where('slug', $existingSummitSlug)->first();
        }

        if (! isset($summit) || ! $summit) {
            $summit = Summit::firstOrCreate(
                ['slug' => $newSummitData['slug']],
                [
                    'domain_id' => $domain->id,
                    'title' => $newSummitData['title'],
                    'topic' => $newSummitData['topic'],
                    'description' => "A 5-day virtual summit on {$newSummitData['topic']}.",
                    'status' => 'published',
                    'current_phase' => 'pre',
                    'timezone' => 'America/New_York',
                    'pre_summit_starts_at' => now()->addDays(30),
                    'late_pre_summit_starts_at' => now()->addDays(37),
                    'during_summit_starts_at' => now()->addDays(44),
                    'post_summit_starts_at' => now()->addDays(51),
                    'ends_at' => now()->addDays(80),
                ]
            );
        }

        $admin = User::where('email', 'admin@example.test')->first();
        if ($admin) {
            $admin->domains()->syncWithoutDetaching([$domain->id]);
        }

        $speakerIds = $this->ensureSpeakers($summit);

        $product = Product::updateOrCreate(
            ['slug' => Str::slug($summit->title).'-vip-pass'],
            [
                'name' => 'VIP All-Access Pass',
                'category' => 'vip_pass',
                'tier' => 'vip',
                'grants_vip_access' => true,
                'description' => 'Unlimited lifetime access to all masterclass recordings, audio edition, transcripts, and exclusive bonuses.',
                'price_pre_summit_cents' => 9700,
                'price_late_pre_cents' => 14700,
                'price_during_cents' => 19700,
                'price_post_summit_cents' => 24700,
                'compare_pre_summit_cents' => 29700,
            ]
        );
        $product->summits()->syncWithoutDetaching([$summit->id]);

        Funnel::where('summit_id', $summit->id)->delete();

        foreach ($funnelSpecs as [$templateKey, $isActive, $name, $slug, $phase]) {
            $sectionConfig = $this->sectionConfigFor($templateKey);

            $funnel = Funnel::create([
                'summit_id' => $summit->id,
                'name' => $name,
                'slug' => $slug,
                'description' => "{$name} for {$summit->title}",
                'target_phase' => $phase,
                'is_active' => $isActive,
                'template_key' => $templateKey,
                'section_config' => $sectionConfig,
            ]);

            $optinContent = $this->optinContentFor($templateKey, $speakerIds, $summit);
            FunnelStep::create([
                'funnel_id' => $funnel->id,
                'step_type' => 'optin',
                'name' => 'Optin',
                'slug' => 'optin',
                'sort_order' => 0,
                'is_published' => true,
                'page_content' => $optinContent,
            ]);

            $salesContent = $this->salesContent($templateKey, $summit);
            FunnelStep::create([
                'funnel_id' => $funnel->id,
                'step_type' => 'sales_page',
                'name' => 'VIP Upgrade',
                'slug' => 'vip-upgrade',
                'sort_order' => 1,
                'product_id' => $product->id,
                'is_published' => true,
                'page_content' => $salesContent,
            ]);

            FunnelStep::create([
                'funnel_id' => $funnel->id,
                'step_type' => 'thank_you',
                'name' => 'Thank You',
                'slug' => 'thank-you',
                'sort_order' => 2,
                'is_published' => true,
                'page_content' => [],
            ]);
        }
    }

    /** @return list<string> */
    private function ensureSpeakers(Summit $summit): array
    {
        $existing = $summit->speakers()->pluck('speakers.id')->all();
        if (count($existing) >= 8) {
            return $existing;
        }

        $speakerData = [
            ['Elena', 'Rodriguez', 'Neuropsychologist · Harvard Medical School', 'The Hidden Strengths of the Divergent Mind'],
            ['James', 'Chen', 'Behavioral Therapist · Stanford ADHD Clinic', 'Building Better Mornings One Routine at a Time'],
            ['Sarah', 'Okafor', 'Educational Psychologist · Columbia University', 'Navigating School Systems With Confidence'],
            ['Michael', 'Brennan', 'Family Therapist · NYU Langone Health', 'From Yelling to Understanding: Scripts That Work'],
            ['Priya', 'Sharma', 'Pediatric Psychiatrist · Johns Hopkins', 'Emotional Regulation: Teaching Kids to Self-Manage'],
            ['David', 'Kimura', 'Neuroscientist · MIT Media Lab', 'The Science Behind Screen Time and ADHD'],
            ['Lisa', 'Thompson', 'Parent Coach · Author of Three Books', 'Calm Parenting in Chaotic Moments'],
            ['Roberto', 'Vega', 'Child Development Specialist · Mayo Clinic', 'Understanding the ADHD Brain at Every Age'],
        ];

        $speakerIds = [];

        foreach ($speakerData as $i => [$first, $last, $title, $masterclass]) {
            $slug = Str::slug("{$first}-{$last}-".Str::random(4));

            $speaker = Speaker::create([
                'slug' => $slug,
                'first_name' => $first,
                'last_name' => $last,
                'title' => $title,
                'short_bio' => "Expert in {$summit->topic}.",
                'masterclass_title' => $masterclass,
                'photo_url' => "https://i.pravatar.cc/300?u={$slug}",
                'sort_order' => $i,
                'is_featured' => $i < 3,
                'free_access_window_hours' => 24,
            ]);

            $summit->speakers()->attach($speaker->id, [
                'day_number' => ($i < 4) ? 1 : 2,
                'sort_order' => $i,
            ]);

            $speakerIds[] = $speaker->id;
        }

        return $speakerIds;
    }

    private function sectionConfigFor(string $templateKey): array
    {
        $sharedSales = ['sales-hero', 'intro', 'vip-bonuses', 'free-gifts', 'upgrade-section', 'price-card', 'sales-speakers', 'comparison-table', 'guarantee', 'why-section'];

        $optinSections = match ($templateKey) {
            'indigo-gold' => ['top-bar', 'hero', 'press', 'trust-badges', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'founders', 'testimonials', 'bonuses', 'pull-quote', 'figures', 'shifts', 'closing-cta', 'faq', 'footer', 'sticky-mobile-cta'],
            'blue-coral' => ['top-bar', 'hero', 'press', 'trust', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'bonuses', 'founders', 'testimonials', 'pull-quote', 'figures', 'shifts', 'closing-cta', 'faq', 'footer'],
            'green-gold' => ['top-bar', 'hero', 'press', 'trust', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'bonuses', 'founders', 'testimonials', 'pull-quote', 'figures', 'shifts', 'closing-cta', 'faq', 'footer'],
            'rust-cream' => ['top-bar', 'hero', 'press', 'trust', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'bonuses', 'founders', 'testimonials', 'pull-quote', 'figures', 'shifts', 'closing-cta', 'faq', 'footer'],
            'cream-sage' => ['top-bar', 'hero', 'press', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'bonuses', 'founders', 'testimonials', 'pull-quote', 'figures', 'shifts', 'faq', 'closing-cta', 'footer'],
            'violet-sun' => ['top-bar', 'hero', 'press', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'bonuses', 'founders', 'testimonials', 'pull-quote', 'figures', 'shifts', 'faq', 'closing-cta', 'footer'],
            'lime-ink' => ['top-bar', 'hero', 'press', 'stats', 'overview', 'speakers', 'outcomes', 'free-gift', 'bonuses', 'founders', 'testimonials', 'pull-quote', 'figures', 'shifts', 'faq', 'closing-cta', 'footer'],
            'ochre-ink' => ['masthead', 'hero', 'summit-overview', 'speakers-by-day', 'value-prop', 'host-founder', 'testimonials-attendees', 'faq', 'closing-cta', 'footer', 'marquee', 'stats-hero', 'supplement', 'bonus-stack', 'pull-quote', 'facts-stats', 'reasons-to-attend'],
        };

        return [
            'optin' => $optinSections,
            'sales_page' => $sharedSales,
            'thank_you' => [],
        ];
    }

    private function optinContentFor(string $templateKey, array $speakerIds, Summit $summit): array
    {
        return match ($templateKey) {
            'indigo-gold' => $this->indigoGoldOptin($speakerIds, $summit),
            'blue-coral' => $this->blueCoralOptin($speakerIds, $summit),
            'green-gold' => $this->greenGoldOptin($speakerIds, $summit),
            'cream-sage' => $this->creamSageOptin($speakerIds, $summit),
            'violet-sun' => $this->violetSunOptin($speakerIds, $summit),
            'rust-cream' => $this->rustCreamOptin($speakerIds, $summit),
            'lime-ink' => $this->limeInkOptin($speakerIds, $summit),
            'ochre-ink' => $this->ochreInkOptin($speakerIds, $summit),
        };
    }

    // ─── Shared section helpers ────────────────────────────────

    private function summitMeta(Summit $summit): array
    {
        return [
            'name' => $summit->title,
            'tagline' => 'Real strategies. Real results.',
            'startDate' => $summit->during_summit_starts_at?->format('Y-m-d') ?? '2026-06-01',
            'endDate' => $summit->post_summit_starts_at?->format('Y-m-d') ?? '2026-06-05',
            'timezone' => $summit->timezone,
        ];
    }

    private function pressOutlets(): array
    {
        return ['CNN', 'TIME', 'USA TODAY', 'The New York Times', 'TEDx', 'BBC', 'Forbes', 'Psychology Today', 'The Atlantic', 'Scientific American', 'The Guardian', 'HuffPost', 'CBS', 'The Washington Post'];
    }

    private function standardOutcomes(): array
    {
        return [
            ['title' => 'Understand Why They Act Out', 'description' => 'See the neuroscience behind the behavior'],
            ['title' => 'End the Yelling Cycle', 'description' => 'Calm responses that actually work'],
            ['title' => 'Fix Morning Chaos', 'description' => 'Routines that reduce daily friction'],
            ['title' => 'Build Emotional Resilience', 'description' => 'Help your child regulate big emotions'],
            ['title' => 'Navigate School Systems', 'description' => 'IEPs, 504s, and teacher communication'],
            ['title' => 'Connect With Other Parents', 'description' => 'You are not alone in this journey'],
        ];
    }

    private function standardBonuses(): array
    {
        return [
            ['valueLabel' => '$97 VALUE', 'title' => 'The ADHD Morning Playbook', 'description' => 'A 7-day system for transforming chaotic mornings into calm, connected starts.', 'bullets' => ['Visual schedule templates', 'Transition scripts that work', 'Calm-down toolkit']],
            ['valueLabel' => '$97 VALUE', 'title' => 'Meltdown to Breakthrough Guide', 'description' => 'Step-by-step de-escalation framework that transforms emotional outbursts into growth moments.', 'bullets' => ['5-step de-escalation method', 'Emotional coaching scripts', 'Printable calm-down cards']],
            ['valueLabel' => '$97 VALUE', 'title' => 'School Advocacy Toolkit', 'description' => 'Everything you need to get your child the support they deserve at school.', 'bullets' => ['IEP/504 request templates', 'Teacher communication scripts', 'Accommodation checklists']],
        ];
    }

    private function standardFounders(): array
    {
        return [
            ['name' => 'Roman Wiltman', 'role' => 'Co-Founder', 'quote' => 'Our journey started when our son was diagnosed at age 6. We felt lost, overwhelmed, and alone. This summit exists so no parent has to feel that way again.', 'initials' => 'RW'],
            ['name' => 'Anisah Semen', 'role' => 'Co-Founder', 'quote' => 'Every child with ADHD has incredible strengths waiting to be unlocked. Our mission is to help parents see those strengths — and nurture them.', 'initials' => 'AS'],
        ];
    }

    private function standardTestimonials(): array
    {
        return [
            ['quote' => 'This summit was life-changing. The expert sessions gave me tools I use every single day. My relationship with my son has completely transformed.', 'name' => 'Rachel Berman', 'location' => 'Ohio, USA', 'initials' => 'RB'],
            ['quote' => "Finally someone who understands. The strategies are practical, not theoretical. My daughter's mornings are so much calmer now.", 'name' => 'Kamila Bosco', 'location' => 'London, UK', 'initials' => 'KB'],
            ['quote' => "My husband and I watched together. For the first time we're on the same page about how to support our ADHD child.", 'name' => 'Jennifer Mitchell', 'location' => 'Toronto, CA', 'initials' => 'JM'],
        ];
    }

    private function standardFigures(): array
    {
        return [
            ['value' => '1 in 9', 'description' => 'Children diagnosed with ADHD in the US'],
            ['value' => '74%', 'description' => 'Parents feel isolated and unsupported'],
            ['value' => '3.2x', 'description' => 'Higher stress levels in ADHD families'],
            ['value' => '15+', 'description' => 'Years of clinical research represented'],
            ['value' => '28%', 'description' => 'School-age children struggle academically'],
            ['value' => '93%', 'description' => 'Of past attendees recommend this summit'],
        ];
    }

    private function standardShifts(): array
    {
        return [
            ['title' => 'From Punishment to Partnership', 'description' => 'Move beyond punishment-based parenting to an evidence-backed approach that builds cooperation naturally, without bribes or threats.'],
            ['title' => 'From Frustration to Understanding', 'description' => "Understand the neuroscience behind ADHD behavior — knowledge that shifts your perspective from \"why won't they listen?\" to \"how can I help?\""],
            ['title' => 'From Chaos to Calm Mornings', 'description' => 'Implement structured routines that reduce daily friction and create predictable, stress-free transitions throughout the day.'],
            ['title' => 'From Isolation to Community', 'description' => 'Connect with thousands of parents who truly understand your experience — no judgement, just support and practical advice.'],
            ['title' => 'From Surviving to Thriving', 'description' => "Discover your child's unique ADHD strengths and learn how to nurture them — turning challenges into superpowers."],
        ];
    }

    private function standardFaqs(): array
    {
        return [
            ['question' => 'Is this summit really free?', 'answer' => 'Yes! All live sessions are 100% free to attend. You can watch every presentation during the 5-day event at no cost. We also offer an optional All-Access Pass if you want lifetime replays and bonus materials.'],
            ['question' => 'How long are the sessions available to watch?', 'answer' => "Each day's sessions are available for 24 hours after they air. The All-Access Pass gives you lifetime access to all recordings."],
            ['question' => "What if I can't watch all five days?", 'answer' => "That's completely fine! Watch what you can, when you can. We'll send you a daily schedule with session highlights so you can prioritize."],
            ['question' => 'Is this only for parents of diagnosed children?', 'answer' => 'Not at all. Whether your child has a formal diagnosis, is in the assessment process, or you simply suspect ADHD, these strategies will help.'],
            ['question' => 'Can I ask the speakers questions?', 'answer' => 'Yes! We host live Q&A sessions after select presentations where you can ask speakers your specific questions directly.'],
            ['question' => 'How do I unsubscribe if I change my mind?', 'answer' => "Click the unsubscribe link at the bottom of any email. Your registration is non-binding — there's nothing to cancel, no credit card required."],
        ];
    }

    private function standardFooter(Summit $summit): array
    {
        return [
            'brandName' => strtoupper($summit->title),
            'tagline' => 'Real strategies. Real results.',
            'brandInitial' => mb_substr($summit->title, 0, 1),
            'links' => [
                ['label' => 'Privacy', 'href' => '/privacy'],
                ['label' => 'Terms', 'href' => '/terms'],
                ['label' => 'Contact', 'href' => '/contact'],
            ],
            'copyright' => '© 2026 All rights reserved.',
        ];
    }

    // ─── indigo-gold ───────────────────────────────────────────

    private function indigoGoldOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'indigo-gold',
            'content' => [
                'summit' => $this->summitMeta($summit),
                'topBar' => ['name' => strtoupper($summit->title)],
                'hero' => [
                    'eyebrow' => 'Become an Empowered Parent in 5 Days:',
                    'headline' => "Discover The Secrets To Help Your Child Reach Their Full Potential At The {$summit->title}",
                    'subheadlineLead' => '40+ Leading Experts',
                    'subheadlineTrail' => ' On Improving Focus, Managing Emotions, Handling Outbursts, Screen Management, And Schoolwork.',
                    'ctaLabel' => 'Get Instant Access →',
                    'giftNoteLead' => 'Register now to get a ',
                    'giftNoteAccent' => 'FREE GIFT',
                    'giftNoteTrail' => ': The Parenting Mastery Collection',
                    'ratingLead' => 'Loved by ',
                    'ratingCount' => '73,124',
                    'ratingTrail' => ' committed parents',
                    'collageSpeakerIds' => array_slice($speakerIds, 0, 6),
                ],
                'press' => ['eyebrow' => 'Our Speakers Have Been Featured In', 'outlets' => $this->pressOutlets()],
                'trustBadges' => ['items' => [
                    ['label' => '100% Free', 'icon' => 'shield'],
                    ['label' => 'No Credit Card Required', 'icon' => 'lock'],
                    ['label' => 'Unsubscribe Anytime', 'icon' => 'info'],
                    ['label' => '73,124+ Parents Registered', 'icon' => 'star'],
                ]],
                'stats' => ['items' => [
                    ['value' => '5', 'label' => 'Days of Live Sessions'],
                    ['value' => '40+', 'label' => 'World-Class Speakers'],
                    ['value' => '50,000+', 'label' => 'Parents Attended'],
                ]],
                'overview' => [
                    'eyebrow' => 'What Is This?',
                    'headline' => "What is {$summit->title}?",
                    'bodyParagraphs' => [
                        'A massive free online event bringing together 40+ leading experts in ADHD, child development, and education — all focused on helping you parent with less stress and more connection.',
                        "Over 5 days, you'll learn evidence-based strategies from neuropsychologists, family therapists, and parents who've been where you are.",
                    ],
                    'ctaLabel' => 'Claim Your Free Seat',
                    'cardHeadline' => '5 Days. 40+ Experts. 100% Free.',
                    'cardSubhead' => 'Watch live or catch the replays',
                ],
                'outcomes' => [
                    'eyebrow' => "What You'll Walk Away With",
                    'headline' => 'Six Transformations By The End Of Day 5',
                    'items' => array_map(fn ($o, $i) => [...$o, 'icon' => ['brain', 'chat', 'clock', 'heart', 'school', 'users'][$i], 'tone' => $i < 3 ? 'brand' : 'gold'], $this->standardOutcomes(), array_keys($this->standardOutcomes())),
                ],
                'freeGift' => [
                    'eyebrow' => 'Register Now & Get This Free',
                    'headline' => 'The Parenting Mastery Collection',
                    'body' => 'A curated bundle of guides, checklists, and scripts designed by our expert speakers — yours free just for registering.',
                    'bullets' => ['Morning routine visual schedule templates', 'De-escalation scripts for meltdowns', 'IEP/504 accommodation request templates', 'Printable calm-down card set'],
                    'ctaLabel' => 'Get Instant Access + Free Gift →',
                    'badgeLabel' => 'FREE GIFT',
                    'cardTitle' => 'The Parenting Mastery Collection',
                    'cardNote' => 'FREE with registration',
                ],
                'bonuses' => [
                    'eyebrow' => 'Plus Free Bonuses',
                    'headline' => 'Three Bonuses Worth $291 — Yours Free',
                    'items' => $this->standardBonuses(),
                    'ctaLabel' => 'Claim Your Free Seat + Bonuses',
                ],
                'founders' => ['headline' => 'From the Founders', 'items' => $this->standardFounders()],
                'testimonials' => ['eyebrow' => 'What Parents Say', 'headline' => '73,124 Parents. One Common Theme.', 'items' => $this->standardTestimonials()],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better your chances of managing their condition and minimizing long-term challenges.', 'attribution' => '— Dr. Sarah Jensen, Pediatric Neuropsychologist'],
                'figures' => ['eyebrow' => 'Why This Matters', 'headline' => 'The Reality of ADHD in Families Today', 'items' => $this->standardFigures()],
                'shifts' => ['eyebrow' => 'Five Big Shifts', 'headline' => 'What Changes By Day 5', 'items' => $this->standardShifts()],
                'closing' => [
                    'headline' => 'Your Free Seat Is Waiting',
                    'chips' => ['40+ expert sessions', '24-hour replay access', 'Live Q&A with experts', 'Parent community', '$291 in free bonuses', '100% free to attend'],
                    'ctaLabel' => 'CLAIM YOUR FREE SEAT →',
                ],
                'faqSection' => ['eyebrow' => 'Common Questions', 'headline' => 'Frequently Asked Questions'],
                'faqs' => $this->standardFaqs(),
                'mobileCta' => ['ctaLabel' => "Get Instant Access — It's Free →"],
                'footer' => $this->standardFooter($summit),
            ],
        ];
    }

    // ─── blue-coral ────────────────────────────────────────────

    private function blueCoralOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'blue-coral',
            'content' => [
                'summit' => $this->summitMeta($summit),
                'topBar' => ['title' => strtoupper($summit->title)],
                'hero' => [
                    'eyebrow' => 'Become an Empowered Parent in 5 Days',
                    'headline' => "Discover The Secrets To Help Your Child Reach Their Full Potential At The {$summit->title}",
                    'subheadlineLead' => '40+ Leading Experts',
                    'subheadlineTrail' => ' On Improving Focus, Managing Emotions, Handling Outbursts, Screen Management, And Schoolwork.',
                    'ctaLabel' => 'Get Instant Access →',
                    'giftNotePrefix' => 'Register now to get a ',
                    'giftNoteHighlight' => 'FREE GIFT',
                    'giftNoteSuffix' => ': The Parenting Mastery Collection',
                    'socialProofLead' => 'Loved by ',
                    'socialProofCount' => '73,124',
                    'socialProofSuffix' => ' committed parents',
                    'avatarSpeakerIds' => array_slice($speakerIds, 0, 4),
                ],
                'press' => ['eyebrow' => 'Our Speakers Have Been Featured In', 'outlets' => $this->pressOutlets()],
                'trustBadges' => ['items' => [
                    ['icon' => 'shield', 'label' => '100% Free'],
                    ['icon' => 'lock', 'label' => 'No Credit Card Required'],
                    ['icon' => 'info', 'label' => 'Unsubscribe Anytime'],
                    ['icon' => 'star', 'label' => '73,124+ Parents Registered'],
                ]],
                'stats' => ['items' => [
                    ['value' => '5', 'label' => 'Days of Live Sessions'],
                    ['value' => '40+', 'label' => 'World-Class Speakers'],
                    ['value' => '50,000+', 'label' => 'Parents Attended'],
                ]],
                'overview' => [
                    'eyebrow' => 'What Is This?',
                    'headline' => "What is {$summit->title}?",
                    'bodyParagraphs' => [
                        'A massive free online event bringing together 40+ leading experts in ADHD, child development, and education — all focused on helping you parent with less stress and more connection.',
                        "Over 5 days, you'll learn evidence-based strategies from neuropsychologists, family therapists, and parents who've been where you are.",
                    ],
                    'ctaLabel' => 'Get Instant Access',
                    'illustrationCaption' => '5 Days. 40+ Experts. 100% Free.',
                    'illustrationSubcaption' => 'Watch live or catch the replays',
                ],
                'speakersDay' => [
                    'dayLabel' => 'DAY 1',
                    'headline' => "Understanding Your Child's Brain",
                    'speakerIds' => array_slice($speakerIds, 0, 8),
                ],
                'outcomes' => [
                    'eyebrow' => "What You'll Walk Away With",
                    'headline' => 'Six Transformations By The End Of Day 5',
                    'items' => $this->standardOutcomes(),
                ],
                'freeGift' => [
                    'eyebrow' => 'Register Now & Get This Free',
                    'headline' => 'The Parenting Mastery Collection',
                    'body' => 'A curated bundle of guides, checklists, and scripts designed by our expert speakers — yours free just for registering.',
                    'bullets' => ['Morning routine visual schedule templates', 'De-escalation scripts for meltdowns', 'IEP/504 accommodation request templates', 'Printable calm-down card set'],
                    'ctaLabel' => 'Get Instant Access + Free Gift →',
                    'badge' => 'FREE GIFT',
                    'cardTitle' => 'The Parenting Mastery Collection',
                    'cardSubtitle' => 'FREE with registration',
                ],
                'bonuses' => [
                    'eyebrow' => 'Plus Free Bonuses',
                    'headline' => 'Three Bonuses Worth $291 — Yours Free',
                    'ctaLabel' => 'Get Instant Access + Bonuses',
                    'items' => $this->standardBonuses(),
                ],
                'founders' => ['headline' => 'From the Founders', 'items' => $this->standardFounders()],
                'testimonials' => [
                    'eyebrow' => 'What Parents Say',
                    'headline' => '73,124 Parents. One Common Theme.',
                    'featured' => [
                        'quote' => 'This summit was life-changing. The expert sessions gave me tools I use every single day. My relationship with my son has completely transformed. For the first time in years, mornings are calm and evenings are connected.',
                        'name' => 'Rachel Berman', 'location' => 'Parent of two, Ohio, USA', 'initials' => 'RB',
                    ],
                    'supporting' => array_slice($this->standardTestimonials(), 1),
                ],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better your chances of managing their condition and minimizing long-term challenges.', 'attribution' => '— Dr. Sarah Jensen, Pediatric Neuropsychologist'],
                'figures' => ['eyebrow' => 'Why This Matters', 'headline' => 'The Reality of ADHD in Families Today', 'items' => $this->standardFigures()],
                'shifts' => ['eyebrow' => 'Five Big Shifts', 'headline' => 'What Changes By Day 5', 'items' => $this->standardShifts()],
                'closing' => [
                    'headline' => 'Your Free Seat Is Waiting',
                    'pills' => ['40+ expert sessions', '24-hour replay access', 'Live Q&A with experts', 'Parent community', '$291 in free bonuses', '100% free to attend'],
                    'ctaLabel' => 'GET INSTANT ACCESS →',
                ],
                'faqSection' => ['eyebrow' => 'Common Questions', 'headline' => 'Frequently Asked Questions'],
                'faqs' => $this->standardFaqs(),
                'footer' => $this->standardFooter($summit),
            ],
        ];
    }

    // ─── green-gold ────────────────────────────────────────────

    private function greenGoldOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'green-gold',
            'content' => [
                'summit' => array_merge($this->summitMeta($summit), ['tagline' => 'A 5-day virtual summit for parents']),
                'topBar' => ['title' => strtoupper($summit->title)],
                'hero' => [
                    'eyebrow' => 'Become an Empowered Parent in 5 Days:',
                    'headline' => "Discover The Secrets To Help Your Child Reach Their Full Potential At The {$summit->title}",
                    'subheadline' => '40+ Leading Experts On Improving Focus, Managing Emotions, Handling Outbursts, Screen Management, And Schoolwork.',
                    'primaryCtaLabel' => 'Get Instant Access',
                    'giftLine' => 'Register now to get a FREE GIFT: The Parenting Mastery Collection',
                    'readerCount' => '73,124',
                    'readerCountSuffix' => 'committed parents',
                    'speakerCountLabel' => '40+ Expert Speakers',
                    'heroSpeakerIds' => array_slice($speakerIds, 0, 6),
                    'socialProofAvatarIds' => array_slice($speakerIds, 0, 4),
                    'blobCard' => ['daysLabel' => '5 Days. 40+ Experts.', 'freeLabel' => '100% Free.', 'subLabel' => 'Watch live or catch the replays'],
                ],
                'press' => ['eyebrow' => 'OUR SPEAKERS HAVE BEEN FEATURED IN', 'outlets' => $this->pressOutlets()],
                'trust' => ['items' => ['100% Free', 'No Credit Card Required', 'Unsubscribe Anytime', '73,124+ Parents Registered']],
                'stats' => ['items' => [
                    ['value' => '5', 'label' => 'Days of Live Sessions'],
                    ['value' => '40+', 'label' => 'World-Class Speakers'],
                    ['value' => '50,000+', 'label' => 'Parents Attended'],
                ]],
                'overview' => [
                    'eyebrow' => 'What Is This?',
                    'headline' => "What is {$summit->title}?",
                    'bodyParagraphs' => [
                        'A massive free online event bringing together 40+ leading experts in ADHD, child development, and education.',
                        "Over 5 days, you'll learn evidence-based strategies from neuropsychologists, family therapists, and parents who've been where you are.",
                    ],
                    'ctaLabel' => 'Get Instant Access',
                    'cardDaysLabel' => '5 Days. 40+ Experts. 100% Free.',
                    'cardSubLabel' => 'Watch live or catch the replays',
                ],
                'speakersDay' => [
                    'dayLabel' => 'DAY 1',
                    'headline' => "Understanding Your Child's Brain",
                    'speakerIds' => array_slice($speakerIds, 0, 8),
                ],
                'outcomes' => ['eyebrow' => "What You'll Walk Away With", 'headline' => 'Six Transformations By The End Of Day 5', 'items' => $this->standardOutcomes()],
                'freeGift' => [
                    'eyebrow' => 'Register Now & Get This Free',
                    'headline' => 'The Parenting Mastery Collection',
                    'body' => 'A curated bundle of guides, checklists, and scripts designed by our expert speakers — yours free just for registering.',
                    'bullets' => ['Morning routine visual schedule templates', 'De-escalation scripts for meltdowns', 'IEP/504 accommodation request templates', 'Printable calm-down card set'],
                    'ctaLabel' => 'Get Instant Access + Free Gift',
                    'bookTitle' => 'The Parenting Mastery Collection',
                    'bookSubLabel' => 'FREE with registration',
                    'badge' => 'FREE GIFT',
                ],
                'bonuses' => ['eyebrow' => 'Plus Free Bonuses', 'headline' => 'Three Bonuses Worth $291 — Yours Free', 'ctaLabel' => 'Get Instant Access + Bonuses', 'items' => $this->standardBonuses()],
                'founders' => ['headline' => 'From the Founders', 'items' => $this->standardFounders()],
                'testimonials' => ['eyebrow' => 'What Parents Say', 'headline' => '73,124 Parents. One Common Theme.', 'items' => $this->standardTestimonials()],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better.', 'attribution' => 'Dr. Sarah Jensen, Pediatric Neuropsychologist'],
                'figures' => ['eyebrow' => 'Why This Matters', 'headline' => 'The Reality of ADHD in Families Today', 'items' => $this->standardFigures()],
                'shifts' => ['eyebrow' => 'Five Big Shifts', 'headline' => 'What Changes By Day 5', 'items' => $this->standardShifts()],
                'closing' => ['headline' => 'Your Free Seat Is Waiting', 'features' => ['40+ expert sessions', '24-hour replay access', 'Live Q&A', 'Parent community', '$291 in free bonuses', '100% free'], 'ctaLabel' => 'GET INSTANT ACCESS'],
                'faqSection' => ['eyebrow' => 'Common Questions', 'headline' => 'Frequently Asked Questions'],
                'faqs' => $this->standardFaqs(),
                'mobileCtaLabel' => 'Get Instant Access',
                'footer' => $this->standardFooter($summit),
            ],
        ];
    }

    // ─── cream-sage ────────────────────────────────────────────

    private function creamSageOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'cream-sage',
            'content' => [
                'summit' => array_merge($this->summitMeta($summit), ['tagline' => 'A softer way to parent a bright, busy mind']),
                'topBar' => ['brandName' => $summit->title, 'dateRangeLabel' => 'Free · Online', 'ctaLabel' => 'Reserve seat'],
                'hero' => [
                    'badgeLabel' => 'Gentle 5-Day Summit',
                    'dateRangeLabel' => 'Free & Online',
                    'headlineLead' => 'Your bright, ',
                    'headlineAccent' => 'busy-minded',
                    'headlineTrail' => ' child is not a problem to be solved.',
                    'subheadline' => "Five days with 40 of the field's most thoughtful neuropsychologists, therapists, and educators — a soft place to land, and the practical guidance to keep going.",
                    'primaryCtaLabel' => 'Reserve your free seat',
                    'secondaryCtaLabel' => 'Learn more',
                    'readerCount' => '73,124',
                    'readerCountSuffix' => 'parents',
                    'readerLeadIn' => 'Loved by',
                    'ratingLabel' => '★ ★ ★ ★ ★',
                    'heroSpeakerIds' => array_slice($speakerIds, 0, 6),
                ],
                'press' => ['eyebrow' => 'As Featured In', 'outlets' => array_slice($this->pressOutlets(), 0, 10)],
                'stats' => [
                    'eyebrow' => 'By the Numbers',
                    'items' => [
                        ['value' => '5', 'label' => 'days of unhurried conversation'],
                        ['value' => '40', 'suffix' => '+', 'label' => 'experts, writers, therapists'],
                        ['value' => '50', 'suffix' => 'K', 'label' => 'parents before you, welcomed softly'],
                    ],
                ],
                'overview' => [
                    'eyebrow' => 'What is This?',
                    'headlineLead' => 'An ',
                    'headlineAccent' => 'unhurried',
                    'headlineTrail' => ' answer to an overwhelming question.',
                    'bodyParagraphs' => [
                        'We built this summit because we could not find it: a generous, evidence-based conversation that treats ADHD parenting as something other than a problem to be fixed.',
                        'Watch live or catch the replays at your pace. The sessions are free. The strategies are real. The relief, we hope, is audible.',
                    ],
                    'ctaLabel' => 'Reserve your seat',
                    'imageCaption' => 'Live talks · a printed Collection · a quiet community',
                ],
                'speakersDay' => [
                    'eyebrow' => 'Day One · Opening Circle',
                    'headlineLead' => 'Understanding ',
                    'headlineAccent' => "your child's",
                    'headlineTrail' => ' brain.',
                    'speakerIds' => array_slice($speakerIds, 0, 8),
                    'ctaLabel' => 'See the full forty — register free →',
                ],
                'outcomes' => [
                    'eyebrow' => 'Six Shifts by Day Five',
                    'headlineLead' => 'What the end of the week ',
                    'headlineAccent' => 'may sound like',
                    'items' => $this->standardOutcomes(),
                ],
                'freeGift' => [
                    'eyebrow' => 'Enclosed with Registration',
                    'headlineLead' => 'A ',
                    'headlineAccent' => 'gentle collection',
                    'headlineTrail' => ', enclosed.',
                    'body' => "A bound selection of scripts, templates, and quiet checklists — drawn from our contributors' clinical practice and printed for the kitchen drawer.",
                    'bullets' => ['Morning-routine visual schedules, tested in real homes', 'De-escalation scripts for meltdowns — the first sentence matters most', 'IEP & 504 request templates — firm, warm, hard to refuse', 'Printable calm-down card set for the refrigerator door'],
                    'ctaLabel' => 'Claim seat + Collection',
                    'cardEyebrow' => 'A Gentle Collection',
                    'cardTitle' => 'The Parenting Mastery Collection',
                    'cardEnclosure' => 'Enclosed with your seat',
                    'cardVolume' => 'Vol. VII · 2026',
                    'cardBadge' => 'FREE GIFT',
                ],
                'bonuses' => [
                    'eyebrow' => 'Three Gentle Bonuses',
                    'headlineLead' => 'Three gifts, ',
                    'headlineAccent' => 'worth $291',
                    'headlineTrail' => ', yours free.',
                    'ctaLabel' => 'Claim seat + all three bonuses',
                    'items' => $this->standardBonuses(),
                ],
                'founders' => ['headline' => 'From the founders', 'items' => $this->standardFounders()],
                'testimonials' => [
                    'eyebrow' => 'What Parents Say',
                    'headlineLead' => '73,124 parents. ',
                    'headlineAccent' => 'One common theme.',
                    'items' => $this->standardTestimonials(),
                ],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better.', 'attribution' => '— Dr. Sarah Jensen · Pediatric Neuropsychologist'],
                'figures' => ['eyebrow' => 'Why This Matters', 'headline' => 'The reality of ADHD in families today.', 'items' => $this->standardFigures()],
                'shifts' => [
                    'eyebrow' => 'Five Gentle Shifts',
                    'headlineLead' => 'What changes by ',
                    'headlineAccent' => 'Day Five',
                    'items' => $this->standardShifts(),
                ],
                'faqSection' => ['eyebrow' => 'Common Questions', 'headline' => 'Gentle answers'],
                'faqs' => $this->standardFaqs(),
                'closing' => [
                    'badgeLabel' => 'Registration open',
                    'headlineLead' => 'Take a deep ',
                    'headlineAccent' => 'breath',
                    'headlineTrail' => '. Then reserve your seat.',
                    'subheadline' => "Five days with forty of the field's most thoughtful minds — yours, free, delivered to your inbox.",
                    'ctaLabel' => 'Reserve your free seat',
                    'fineprint' => 'Free · No credit card · Unsubscribe anytime',
                ],
                'footer' => array_merge($this->standardFooter($summit), ['tagline' => 'A softer way to parent a bright, busy mind.']),
            ],
        ];
    }

    // ─── violet-sun ────────────────────────────────────────────

    private function violetSunOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'violet-sun',
            'content' => [
                'summit' => array_merge($this->summitMeta($summit), ['tagline' => 'Rewire the way your family handles hard moments']),
                'topBar' => ['brandName' => $summit->title, 'dateLabel' => '100% free', 'ctaLabel' => 'Reserve Seat →'],
                'hero' => [
                    'pillLabel' => '5-Day Summit · Free & Online',
                    'headlineAccent' => 'Rewire',
                    'headlineTrail' => ' the way your family handles hard moments.',
                    'subheadline' => "Five evenings with 40+ of the field's sharpest clinicians, neuroscientists, and educators. Real scripts. Real calm. Real change by Friday.",
                    'primaryCtaLabel' => 'Claim your free seat',
                    'secondaryCtaLabel' => "See what's inside",
                    'ratingLabel' => '4.9 / 5',
                    'readerCountLead' => 'Loved by',
                    'readerCount' => '73,124',
                    'readerCountSuffix' => 'parents',
                    'freeBadge' => '100% FREE',
                    'moreLabel' => '+36 more contributors this week',
                    'heroSpeakerIds' => array_slice($speakerIds, 0, 4),
                ],
                'press' => ['eyebrow' => 'Our speakers have appeared in', 'outlets' => array_slice($this->pressOutlets(), 0, 10)],
                'stats' => [
                    'eyebrow' => 'By the numbers',
                    'items' => [
                        ['value' => '5', 'description' => 'days of live, high-signal sessions'],
                        ['value' => '40', 'suffix' => '+', 'description' => 'neuroscientists, therapists, educators'],
                        ['value' => '50', 'suffix' => 'K', 'description' => "parents who've attended before"],
                    ],
                ],
                'overview' => [
                    'eyebrow' => 'What is this?',
                    'headlineLead' => 'A ',
                    'headlineHighlight' => '5-day intensive',
                    'headlineMid' => ' for the parent who is ',
                    'headlineAccent' => 'done winging it',
                    'headlineTrail' => '.',
                    'bodyParagraphs' => [
                        "The summit is a free online event that brings 40+ of the field's sharpest clinicians and educators into your living room for one focused week.",
                        'Evidence-based. Script-rich. Zero fluff. Watch live or catch the replays.',
                    ],
                    'ctaLabel' => 'Claim your free seat',
                    'cardEyebrow' => "What's inside",
                    'components' => [
                        ['title' => 'Live Expert Sessions', 'description' => '20 core hours over 5 evenings. Recorded for catch-up.'],
                        ['title' => 'Printable Collection', 'description' => 'Scripts, schedules, templates — yours to keep.'],
                        ['title' => 'Parent Community', 'description' => 'Optional channel for late-night questions.'],
                    ],
                ],
                'speakersDay' => [
                    'dayLabel' => 'Day 01 · Opening Circle',
                    'headlineLead' => "Understanding your child's ",
                    'headlineAccent' => 'brain',
                    'headlineTrail' => '.',
                    'countLabel' => '8 of 40 speakers →',
                    'speakerIds' => array_slice($speakerIds, 0, 8),
                    'ctaLabel' => 'See all 40 speakers →',
                ],
                'outcomes' => [
                    'eyebrow' => 'Six shifts by Day 5',
                    'headlineLead' => 'What the end of the week ',
                    'headlineAccent' => 'may sound like',
                    'items' => $this->standardOutcomes(),
                ],
                'freeGift' => [
                    'eyebrow' => 'Included with Registration',
                    'headlineLead' => 'The Parenting Mastery ',
                    'headlineAccent' => 'Collection',
                    'headlineTrail' => '.',
                    'body' => 'A curated bundle of scripts, templates, and checklists engineered by our expert speakers. Sent the moment you register.',
                    'bullets' => ['Morning routine visual schedules', 'De-escalation scripts for meltdowns', 'IEP/504 accommodation templates', 'Printable calm-down card set'],
                    'ctaLabel' => 'Register — get the Collection',
                    'cardTitle' => 'The Parenting Mastery Collection',
                    'cardSubtitle' => 'FREE with registration · 2026 Edition',
                    'cardBadge' => '$127 VALUE · FREE',
                ],
                'bonuses' => [
                    'eyebrow' => 'Plus three bonuses',
                    'headlineHighlight' => '$291 value',
                    'headlineTrail' => ' — yours free.',
                    'ctaLabel' => 'Claim seat + all 3 bonuses',
                    'items' => array_map(fn ($b, $i) => [...$b, 'label' => 'Bonus 0'.($i + 1)], $this->standardBonuses(), array_keys($this->standardBonuses())),
                ],
                'founders' => ['headlineLead' => 'From the ', 'headlineAccent' => 'founders', 'items' => $this->standardFounders()],
                'testimonials' => ['eyebrow' => 'Reviews', 'headlineLead' => '73,124 parents. ', 'headlineAccent' => '4.9 out of 5.', 'items' => $this->standardTestimonials()],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better.', 'attribution' => 'Dr. Sarah Jensen · Neuropsychologist'],
                'figures' => [
                    'eyebrow' => 'Why this matters',
                    'headlineLead' => 'The ',
                    'headlineAccent' => 'reality',
                    'headlineTrail' => ' of ADHD in families today.',
                    'items' => array_map(fn ($f, $i) => [...$f, 'label' => 'Fig. 0'.($i + 1), 'trend' => $i < 5 ? 'rising' : 'plateau'], $this->standardFigures(), array_keys($this->standardFigures())),
                ],
                'shifts' => ['eyebrow' => 'Five big shifts', 'headlineLead' => 'What changes by ', 'headlineAccent' => 'Day Five', 'items' => $this->standardShifts()],
                'faqSection' => ['eyebrow' => 'Common questions', 'headlineLead' => 'Quick ', 'headlineAccent' => 'answers'],
                'faqs' => $this->standardFaqs(),
                'closing' => [
                    'eyebrow' => 'Registration open',
                    'headlineLead' => "Rewire your family's ",
                    'headlineAccent' => 'hard moments',
                    'headlineTrail' => '.',
                    'subheadline' => "5 days. 40+ experts. Free. The next five evenings could be the reset you've been waiting for.",
                    'ctaLabel' => 'Claim your free seat',
                    'fineprint' => 'Free · No credit card · Unsubscribe anytime',
                ],
                'footer' => [
                    'brandName' => $summit->title,
                    'tagline' => 'The annual 5-day intensive for parents who want science, scripts, and real calm.',
                    'summitLinksLabel' => 'Summit',
                    'summitLinks' => [['label' => 'Schedule', 'href' => '#schedule'], ['label' => 'Speakers', 'href' => '#speakers'], ['label' => 'Bonuses', 'href' => '#bonuses']],
                    'legalLinksLabel' => 'Legal',
                    'legalLinks' => [['label' => 'Privacy', 'href' => '/privacy'], ['label' => 'Terms', 'href' => '/terms'], ['label' => 'Cookies', 'href' => '/cookies']],
                    'contactLabel' => 'Contact',
                    'contactEmail' => 'support@example.com',
                    'copyright' => '© 2026 All rights reserved.',
                    'signoff' => "Made with care, for the parent who's tired but still showing up.",
                ],
            ],
        ];
    }

    // ─── rust-cream ────────────────────────────────────────────

    private function rustCreamOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'rust-cream',
            'content' => [
                'summit' => $this->summitMeta($summit),
                'topBar' => ['name' => strtoupper($summit->title)],
                'hero' => [
                    'eyebrow' => 'Become an Empowered Parent in 5 Days:',
                    'headline' => "Discover The Secrets To Help Your Child Reach Their Full Potential At The {$summit->title}",
                    'subheadline' => 'On Improving Focus, Managing Emotions, Handling Outbursts, Screen Management, And Schoolwork.',
                    'subheadlineLead' => '40+ Leading Experts',
                    'ctaLabel' => 'Get Instant Access →',
                    'freeGiftLine' => 'Register now to get a',
                    'freeGiftEmphasis' => 'FREE GIFT',
                    'freeGiftSuffix' => ': The Parenting Mastery Collection',
                    'readerCount' => '73,124',
                    'readerCountPrefix' => 'Loved by',
                    'readerCountSuffix' => 'parents',
                    'heroSpeakerIds' => array_slice($speakerIds, 0, 6),
                ],
                'press' => ['eyebrow' => 'Our Speakers Have Been Featured In', 'outlets' => $this->pressOutlets()],
                'trust' => ['items' => [
                    ['label' => '100% Free', 'icon' => 'shield'],
                    ['label' => 'No Credit Card Required', 'icon' => 'lock'],
                    ['label' => 'Unsubscribe Anytime', 'icon' => 'info'],
                    ['label' => '73,124+ Parents Registered', 'icon' => 'star'],
                ]],
                'stats' => ['items' => [
                    ['value' => '5', 'label' => 'Days of Live Sessions'],
                    ['value' => '40+', 'label' => 'World-Class Speakers'],
                    ['value' => '50,000+', 'label' => 'Parents Attended'],
                ]],
                'overview' => [
                    'eyebrow' => 'What Is This?',
                    'headline' => "What is {$summit->title}?",
                    'bodyParagraphs' => [
                        'A massive free online event bringing together 40+ leading experts in ADHD, child development, and education.',
                        "Over 5 days, you'll learn evidence-based strategies from neuropsychologists, family therapists, and parents who've been where you are.",
                    ],
                    'ctaLabel' => 'Get Instant Access',
                    'cardHeadline' => '5 Days. 40+ Experts. 100% Free.',
                    'cardSubtext' => 'Watch live or catch the replays',
                ],
                'speakersDay' => [
                    'dayLabel' => 'DAY 1',
                    'headline' => "Understanding Your Child's Brain",
                    'speakerIds' => array_slice($speakerIds, 0, 8),
                ],
                'outcomes' => [
                    'eyebrow' => "What You'll Walk Away With",
                    'headline' => 'Six Transformations By The End Of Day 5',
                    'items' => array_map(fn ($o, $i) => [...$o, 'accent' => $i < 3 ? 'primary' : 'secondary'], $this->standardOutcomes(), array_keys($this->standardOutcomes())),
                ],
                'freeGift' => [
                    'eyebrow' => 'Register Now & Get This Free',
                    'headline' => 'The Parenting Mastery Collection',
                    'body' => 'A curated bundle of guides, checklists, and scripts designed by our expert speakers — yours free just for registering.',
                    'bullets' => ['Morning routine visual schedule templates', 'De-escalation scripts for meltdowns', 'IEP/504 accommodation request templates', 'Printable calm-down card set'],
                    'ctaLabel' => 'Get Instant Access →',
                    'badgeLabel' => 'FREE GIFT',
                    'mockupTitle' => 'The Parenting Mastery Collection',
                    'mockupSubtitle' => 'FREE with registration',
                ],
                'bonuses' => ['eyebrow' => 'Plus Free Bonuses', 'headline' => 'Three Bonuses Worth $291 — Yours Free', 'ctaLabel' => 'Get Instant Access', 'items' => $this->standardBonuses()],
                'founders' => ['headline' => 'From the Founders', 'items' => $this->standardFounders()],
                'testimonials' => ['eyebrow' => 'What Parents Say', 'headline' => '73,124 Parents. One Common Theme.', 'items' => $this->standardTestimonials()],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better.', 'attribution' => '— Dr. Sarah Jensen, Pediatric Neuropsychologist'],
                'figures' => ['eyebrow' => 'Why This Matters', 'headline' => 'The Reality of ADHD in Families Today', 'items' => $this->standardFigures()],
                'shifts' => ['eyebrow' => 'Five Big Shifts', 'headline' => 'What Changes By Day 5', 'items' => $this->standardShifts()],
                'closing' => [
                    'headline' => 'Your Free Seat Is Waiting',
                    'ctaLabel' => 'GET INSTANT ACCESS →',
                    'pills' => ['40+ expert sessions', '24-hour replay access', 'Live Q&A with experts', 'Parent community', '$291 in free bonuses', '100% free to attend'],
                ],
                'faqSection' => ['eyebrow' => 'Common Questions', 'headline' => 'Frequently Asked Questions'],
                'faqs' => $this->standardFaqs(),
                'mobileCta' => ['label' => 'Get Instant Access →'],
                'footer' => $this->standardFooter($summit),
            ],
        ];
    }

    // ─── lime-ink ──────────────────────────────────────────────

    private function limeInkOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'lime-ink',
            'content' => [
                'summit' => array_merge($this->summitMeta($summit), ['tagline' => 'A neurosciency intensive for parents']),
                'topBar' => [
                    'codeTag' => '['.strtoupper(Str::slug($summit->title)).']',
                    'name' => $summit->title,
                    'statusPill' => 'FREE · 2026',
                    'ctaLabel' => 'Register →',
                ],
                'hero' => [
                    'sectionLabel' => '01 → HERO',
                    'dateRangeLabel' => '5 Days · 2026',
                    'eyebrow' => 'A 5-day intensive · for parents · science-backed',
                    'heroLine1' => "Your kid isn't broken.",
                    'headlineLead' => 'The',
                    'headlineAccent' => 'system',
                    'headlineTrail' => 'around them is.',
                    'subheadline' => "Five days. Forty clinicians, neuroscientists, and educators. Zero fluff. The {$summit->title} gives you the scripts, frameworks, and research to rebuild the system around your child.",
                    'primaryCtaLabel' => 'Register free',
                    'secondaryCtaLabel' => "See what's inside",
                    'readerCount' => '73,124',
                    'readerCountSuffix' => 'parents registered',
                    'ratingLabel' => '4.9/5',
                    'featuredLabel' => 'FEATURED / DAY ONE',
                    'moreLabel' => '+36 MORE THIS WEEK →',
                    'heroSpeakerIds' => array_slice($speakerIds, 0, 4),
                ],
                'press' => ['eyebrow' => 'OUR SPEAKERS HAVE APPEARED IN', 'outlets' => array_slice($this->pressOutlets(), 0, 10)],
                'stats' => [
                    'sectionLabel' => '02 → BY THE NUMBERS',
                    'items' => [
                        ['label' => 'DURATION', 'value' => '5', 'description' => 'days of live intensive sessions'],
                        ['label' => 'EXPERTS', 'value' => '40', 'suffix' => '+', 'description' => 'neuropsychologists, therapists, educators'],
                        ['label' => 'ATTENDED', 'value' => '50', 'suffix' => 'K', 'description' => 'parents before you, last five years'],
                    ],
                ],
                'overview' => [
                    'sectionLabel' => '03 → OVERVIEW',
                    'headlineLead' => "It's a five-day ",
                    'headlineAccent' => 'operating system',
                    'headlineTrail' => ' update for your family.',
                    'bodyParagraphs' => [
                        "Forty of the field's sharpest clinicians and educators, four plenaries a day, one unified framework — delivered free.",
                        "Watch live. Catch replays. Bring your partner. The sessions are short, dense, and engineered for parents who don't have time for fluff.",
                    ],
                    'ctaLabel' => 'Claim your free seat',
                    'systemCardLabel' => 'SYSTEM COMPONENTS',
                    'components' => [
                        ['title' => 'Live Plenaries', 'description' => 'Evening sessions, recorded. 5 days × 4 talks = 20 core hours.'],
                        ['title' => 'Printable Collection', 'description' => 'Scripts, templates, checklists. Yours to keep.'],
                        ['title' => 'Peer Community', 'description' => 'Optional group for late-night questions.'],
                    ],
                ],
                'speakersDay' => [
                    'sectionLabel' => '04 → SPEAKERS · DAY 01',
                    'headline' => "Understanding Your Child's Brain",
                    'countLabel' => '8 OF 40 →',
                    'speakerIds' => array_slice($speakerIds, 0, 8),
                    'ctaLabel' => 'See all 40 speakers — register free →',
                ],
                'outcomes' => [
                    'sectionLabel' => '05 → OUTCOMES',
                    'headlineLead' => 'Six shifts by Day Five. ',
                    'headlineTrail' => 'Measured, not aspirational.',
                    'itemBadge' => 'OUTCOME',
                    'items' => $this->standardOutcomes(),
                ],
                'freeGift' => [
                    'codeEyebrow' => 'INCLUDED.WITH.REGISTRATION',
                    'headline' => 'The Parenting Mastery Collection.',
                    'body' => 'A curated bundle of scripts, templates, and checklists — engineered by our expert speakers.',
                    'bullets' => ['Morning routine visual schedules', 'De-escalation scripts for meltdowns', 'IEP/504 accommodation templates', 'Printable calm-down card set'],
                    'ctaLabel' => 'Register — get the Collection',
                    'cardFilename' => 'COLLECTION.ZIP',
                    'cardTitle' => 'Parenting Mastery',
                    'cardFiles' => ['├── morning-schedules.pdf', '├── deescalation-scripts.pdf', '├── iep-504-templates.pdf', '└── calm-down-cards.pdf'],
                    'cardCommand' => '$ download --free',
                    'cardBadge' => '$127 VALUE · FREE',
                ],
                'bonuses' => [
                    'sectionLabel' => '06 → BONUSES',
                    'headlineLead' => 'Three bonuses, ',
                    'headlineAccent' => '$291 value',
                    'headlineTrail' => ', zero cost.',
                    'subhead' => 'Bundled free with every seat.',
                    'ctaLabel' => 'Claim seat + all 3 bonuses',
                    'items' => array_map(fn ($b, $i) => [...$b, 'filename' => 'BONUS_0'.($i + 1).'.md'], $this->standardBonuses(), array_keys($this->standardBonuses())),
                ],
                'founders' => [
                    'sectionLabel' => '07 → TEAM',
                    'headline' => 'From the founders',
                    'items' => array_map(fn ($f) => [...$f, 'role' => strtoupper($f['role'])], $this->standardFounders()),
                ],
                'testimonials' => [
                    'sectionLabel' => '08 → REVIEWS',
                    'headlineLead' => '73,124 parents. ',
                    'headlineTrail' => '4.9 / 5.',
                    'subhead' => 'One recurring theme: the relief is audible.',
                    'items' => array_map(fn ($t) => [...$t, 'location' => strtoupper($t['location'])], $this->standardTestimonials()),
                ],
                'pullQuote' => ['eyebrow' => '// PULL QUOTE', 'quote' => 'The earlier you learn how to support your child with ADHD, the better.', 'attribution' => 'DR. SARAH JENSEN · NEUROPSYCHOLOGIST'],
                'figures' => [
                    'sectionLabel' => '09 → WHY THIS MATTERS',
                    'headline' => 'The reality of ADHD in families today.',
                    'items' => array_map(fn ($f, $i) => [...$f, 'label' => 'FIG 0'.($i + 1), 'trend' => $i < 5 ? 'rising' : 'plateau'], $this->standardFigures(), array_keys($this->standardFigures())),
                ],
                'shifts' => [
                    'sectionLabel' => '10 → SHIFTS',
                    'headline' => 'What changes by Day Five',
                    'items' => [
                        ['title' => 'Punishment → Partnership', 'description' => 'Move beyond punishment-based parenting to an evidence-backed approach.'],
                        ['title' => 'Reacting → Anticipating', 'description' => 'See meltdowns coming 20 minutes out. Redirect the nervous system before the room is on fire.'],
                        ['title' => 'Isolated → Supported', 'description' => 'A cohort of parents who have been where you are.'],
                        ['title' => 'Overwhelmed → Equipped', 'description' => 'Vague anxiety, out. Specific language and tools, in.'],
                        ['title' => 'Shame → Sovereignty', 'description' => "Your child's neurology is not a verdict on your parenting."],
                    ],
                ],
                'faqSection' => ['sectionLabel' => '11 → FAQ', 'headline' => 'Frequently asked'],
                'faqs' => $this->standardFaqs(),
                'closing' => [
                    'eyebrow' => '// REGISTRATION OPEN',
                    'headline' => 'Update the operating system of your family.',
                    'subheadline' => "5 days. 40 experts. Free. The next five evenings could be the reset you've been waiting for.",
                    'ctaLabel' => 'Register free',
                    'fineprint' => 'FREE · NO CREDIT CARD · UNSUBSCRIBE ANYTIME',
                ],
                'footer' => [
                    'codeTag' => '['.strtoupper(Str::slug($summit->title)).']',
                    'brandName' => $summit->title,
                    'tagline' => 'The annual 5-day intensive for parents who want science, not fluff.',
                    'summitLinksLabel' => 'SUMMIT',
                    'summitLinks' => [['label' => 'Schedule', 'href' => '#schedule'], ['label' => 'Speakers', 'href' => '#speakers'], ['label' => 'Bonuses', 'href' => '#bonuses']],
                    'legalLinksLabel' => 'LEGAL',
                    'legalLinks' => [['label' => 'Privacy', 'href' => '/privacy'], ['label' => 'Terms', 'href' => '/terms'], ['label' => 'Cookies', 'href' => '/cookies']],
                    'contactLabel' => 'CONTACT',
                    'contactEmail' => 'support@example.com',
                    'copyright' => '© 2026 All rights reserved.',
                ],
            ],
        ];
    }

    // ─── ochre-ink ─────────────────────────────────────────────

    private function ochreInkOptin(array $speakerIds, Summit $summit): array
    {
        return [
            'template_key' => 'ochre-ink',
            'content' => [
                'summit' => array_merge($this->summitMeta($summit), ['tagline' => 'Real strategies for real families']),
                'masthead' => ['volume' => 'Vol. VII · 2026', 'eyebrow' => 'An Annual Reader'],
                'hero' => [
                    'issueLabel' => 'Issue No. VII',
                    'dateRangeLabel' => '5 Days · 2026',
                    'metaLabel' => '100% Free · Online',
                    'readerCount' => '73,124 Readers',
                    'eyebrow' => 'A Five-Day Editorial Series for Parents',
                    'headline' => 'The Child You Were Told Was Too Much Is, In Fact, Right On Time.',
                    'subheadline' => "Forty of the field's most patient minds gather for five days to answer the questions you've been asking alone at 2 a.m.",
                    'ctaLabel' => 'Reserve your seat',
                    'ctaSubtext' => 'A complimentary Parenting Collection is enclosed with every seat.',
                    'ratingText' => 'Loved by 73,124 committed parents',
                    'figCaption' => "Fig. 1 — A selection of this issue's contributors",
                    'heroSpeakerIds' => array_slice($speakerIds, 0, 4),
                ],
                'featuredIn' => array_slice($this->pressOutlets(), 0, 10),
                'socialProof' => [
                    'statLabel1' => 'days of live, unhurried conversation', 'statValue1' => '5',
                    'statLabel2' => 'experts, clinicians, and writers', 'statValue2' => '40+',
                    'statLabel3' => "parents who've attended before you", 'statValue3' => '50K',
                ],
                'whatIsThis' => [
                    'roman' => 'II.',
                    'headline' => 'An Unhurried Answer to an Overwhelming Question',
                    'bodyParagraphs' => [
                        'We built this summit because we could not find the thing we needed: a generous, evidence-based conversation that treats ADHD parenting as something other than a problem to be fixed.',
                        'Watch live or catch the replays at your own pace. The sessions are free. The strategies are real.',
                    ],
                    'ctaLabel' => 'Claim your seat',
                ],
                'featureBand' => [
                    'eyebrow' => "Editors' Note",
                    'headline' => "Editors' Note",
                    'body' => 'A three-part preface to the issue.',
                    'bullets' => [
                        'Five evenings, not five weeks. Sessions run 90 minutes each.',
                        'Forty contributors. Neuropsychologists, family therapists, educators.',
                        'A complimentary Collection. Scripts, templates, and checklists — sent by email on registration.',
                    ],
                ],
                'speakersByDay' => [
                    [
                        'dayLabel' => 'Contributors — Day One',
                        'dayDate' => $summit->during_summit_starts_at?->format('Y-m-d') ?? '2026-06-01',
                        'dayTheme' => "Understanding Your Child's Brain",
                        'roman' => 'III.',
                        'speakerIds' => array_slice($speakerIds, 0, 4),
                    ],
                ],
                'transformations' => [
                    'roman' => 'IV.',
                    'headline' => 'Six Transformations, One Week.',
                    'subhead' => 'What the end of Day Five may sound like at your kitchen table.',
                    'items' => $this->standardOutcomes(),
                ],
                'supplement' => [
                    'cardLabel' => 'Supplement',
                    'cardTitle' => 'The Parenting Mastery Collection',
                    'cardFooter' => 'Issued with your complimentary seat',
                    'cardVolume' => 'Vol. VII · 2026',
                    'badgeLabel' => 'ENCLOSED FREE',
                    'eyebrow' => 'Issued with Registration',
                    'headline' => 'A Collection, Enclosed.',
                    'body' => "A bound selection of scripts, templates, and quiet checklists — drawn from our contributors' clinical practice.",
                    'bullets' => [
                        'Morning-routine visual schedules, tested in real homes.',
                        'De-escalation scripts for meltdowns — the first sentence matters most.',
                        'IEP & 504 request templates. Firm, warm, hard to refuse.',
                        'A printable calm-down card set for the refrigerator door.',
                    ],
                    'ctaLabel' => 'Claim Your Seat & Supplement',
                ],
                'bonusStackSection' => [
                    'roman' => 'V.',
                    'headline' => 'Three Sidebars, Three Bonuses.',
                    'subhead' => 'Worth $291 in print. Enclosed with every seat.',
                    'ctaLabel' => 'Claim Seat + All Three Sidebars',
                ],
                'bonusStack' => $this->standardBonuses(),
                'founders' => ['roman' => 'VI.', 'headline' => 'From the Founders', 'items' => $this->standardFounders()],
                'testimonials' => [
                    'roman' => 'VII.',
                    'headline' => 'Letters to the Editor',
                    'subhead' => 'A sampling from 73,124 past readers.',
                    'items' => $this->standardTestimonials(),
                ],
                'pullQuote' => ['quote' => 'The earlier you learn how to support your child with ADHD, the better.', 'attribution' => 'Dr. Sarah Jensen · Neuropsychologist'],
                'figures' => [
                    'roman' => 'VIII.',
                    'headline' => 'The Reality of ADHD in Families Today',
                    'subhead' => 'Six figures, drawn from clinical research.',
                    'items' => array_map(fn ($f, $i) => [...$f, 'label' => 'Fig. '.($i + 1)], $this->standardFigures(), array_keys($this->standardFigures())),
                ],
                'shifts' => [
                    'roman' => 'IX.',
                    'headline' => 'What Changes by Day Five',
                    'items' => $this->standardShifts(),
                ],
                'faqs' => $this->standardFaqs(),
                'closing' => [
                    'eyebrow' => 'Reservation Open',
                    'headline' => 'Your copy of Issue VII is ready.',
                    'subheadline' => "Five days with forty of the field's most thoughtful minds — yours, free, delivered to your inbox.",
                    'ctaLabel' => 'Reserve Your Seat',
                    'fineprint' => 'Free · No credit card · Unsubscribe anytime',
                ],
                'footer' => [
                    'tagline' => 'Issued annually, to the households who need it most.',
                    'volume' => 'Vol. VII · 2026',
                    'copyright' => '© 2026 All rights reserved.',
                ],
            ],
        ];
    }

    // ─── Shared sales page content (indigo-gold format) ────────

    private function salesContent(string $templateKey, Summit $summit): array
    {
        return [
            'template_key' => $templateKey,
            'content' => [
                'topBar' => ['name' => $summit->title],
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
                    'headline' => 'Your Comprehensive Guide',
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
                    'headline' => 'To Make Your Journey Easier TODAY',
                    'items' => [
                        ['giftNumber' => 1, 'title' => 'Summit Digest Emails', 'description' => 'Bite-sized emails breaking down summit content.', 'valueLabel' => 'Value: $49'],
                        ['giftNumber' => 2, 'title' => 'Same-Page Style Guidebook', 'description' => 'Align with your partner on approach.', 'valueLabel' => 'Value: $49'],
                        ['giftNumber' => 3, 'title' => 'Reclaim Your Time Guidebook', 'description' => '50 practical time-saving hacks.', 'valueLabel' => 'Value: $49'],
                        ['giftNumber' => 4, 'title' => 'Pocket-Saving Hacks', 'description' => '50 tips to save $100 every month.', 'valueLabel' => 'Value: $49'],
                    ],
                    'deliveryNote' => 'All gifts delivered to your email immediately.',
                ],
                'upgradeSection' => [
                    'eyebrow' => 'Upgrade To The VIP Pass',
                    'headline' => 'Today',
                    'paragraphs' => [
                        'Imagine having a comprehensive library of expert advice at your fingertips.',
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
                    'giftItems' => ['Gift 1: Summit Digest Emails', 'Gift 2: Same-Page Style Guidebook', 'Gift 3: Reclaim Your Time Guidebook', 'Gift 4: Pocket-Saving Hacks'],
                    'totalValue' => '$1,117',
                    'regularPrice' => '$197',
                    'currentPrice' => '$147',
                    'savings' => 'Save $50',
                    'ctaLabel' => 'Upgrade to VIP Now',
                    'guarantee' => '14-day money-back guarantee',
                ],
                'salesSpeakers' => ['eyebrow' => 'Learn From These', 'headline' => '40+ World-Leading Experts'],
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
                        'We designed this Summit with a deep understanding of the unique challenges you face.',
                        'The insights are too valuable to disappear after 24 hours.',
                    ],
                ],
                'footer' => $this->standardFooter($summit),
            ],
        ];
    }
}
