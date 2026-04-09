<?php

namespace Database\Seeders;

use App\Models\Affiliate;
use App\Models\Coupon;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\FunnelStepBump;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitPhaseSchedule;
use App\Models\SummitSpeaker;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // --- Admin User ---
        $admin = User::updateOrCreate(
            ['email' => 'admin@summit-builder.com'],
            [
                'name' => 'Admin',
                'first_name' => 'Summit',
                'last_name' => 'Admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        // --- Summit ---
        $summit = Summit::create([
            'slug' => 'aws25',
            'title' => 'Althea Wellness Summit 2025',
            'description' => 'A 5-day online summit featuring world-class wellness experts sharing their latest research and practices.',
            'topic' => 'Wellness & Health',
            'status' => 'published',
            'current_phase' => 'pre_summit',
            'timezone' => 'America/New_York',
            'starts_at' => now()->addDays(30),
            'ends_at' => now()->addDays(35),
        ]);

        // --- Phase Schedules ---
        SummitPhaseSchedule::create(['summit_id' => $summit->id, 'phase' => 'pre_summit', 'starts_at' => now(), 'ends_at' => now()->addDays(20)]);
        SummitPhaseSchedule::create(['summit_id' => $summit->id, 'phase' => 'late_pre_summit', 'starts_at' => now()->addDays(20), 'ends_at' => now()->addDays(30)]);
        SummitPhaseSchedule::create(['summit_id' => $summit->id, 'phase' => 'during_summit', 'starts_at' => now()->addDays(30), 'ends_at' => now()->addDays(35)]);
        SummitPhaseSchedule::create(['summit_id' => $summit->id, 'phase' => 'post_summit', 'starts_at' => now()->addDays(35), 'ends_at' => null]);

        // --- Speakers ---
        $speakers = [];
        $speakerData = [
            ['first_name' => 'Sarah', 'last_name' => 'Chen', 'title' => 'Neuroscience Researcher', 'masterclass' => 'The Science of Sleep & Recovery'],
            ['first_name' => 'Marcus', 'last_name' => 'Williams', 'title' => 'Functional Medicine Doctor', 'masterclass' => 'Gut Health Revolution'],
            ['first_name' => 'Elena', 'last_name' => 'Rodriguez', 'title' => 'Mindfulness Coach', 'masterclass' => 'Stress-Free Living Framework'],
            ['first_name' => 'James', 'last_name' => 'Park', 'title' => 'Nutrition Scientist', 'masterclass' => 'Anti-Inflammatory Eating'],
            ['first_name' => 'Amara', 'last_name' => 'Okafor', 'title' => 'Movement Specialist', 'masterclass' => 'Daily Movement Protocol'],
            ['first_name' => 'David', 'last_name' => 'Foster', 'title' => 'Longevity Expert', 'masterclass' => 'The Longevity Blueprint'],
        ];

        foreach ($speakerData as $i => $data) {
            $speaker = Speaker::create([
                'slug' => Str::slug($data['first_name'].'-'.$data['last_name']),
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'title' => $data['title'],
                'short_description' => "Leading expert in wellness and {$data['title']}.",
                'social_links' => ['linkedin' => 'https://linkedin.com/in/'.Str::slug($data['first_name'].$data['last_name'])],
            ]);

            SummitSpeaker::create([
                'summit_id' => $summit->id,
                'speaker_id' => $speaker->id,
                'masterclass_title' => $data['masterclass'],
                'masterclass_description' => "Join {$data['first_name']} for an in-depth masterclass on {$data['masterclass']}.",
                'presentation_day' => now()->addDays(30 + ($i % 5)),
                'sort_order' => $i,
                'is_featured' => $i < 3,
                'free_access_window_hours' => 24,
            ]);

            $speakers[] = $speaker;
        }

        // --- Product Categories ---
        $passCategory = ProductCategory::create(['slug' => 'passes', 'name' => 'Passes', 'sort_order' => 0]);
        $bundleCategory = ProductCategory::create(['slug' => 'bundles', 'name' => 'Bundles', 'sort_order' => 1]);

        // --- Products ---
        $vipPass = Product::create([
            'summit_id' => $summit->id,
            'category_id' => $passCategory->id,
            'slug' => 'vip-pass',
            'name' => 'VIP All-Access Pass',
            'description' => 'Lifetime access to all speaker videos, bonuses, and exclusive Q&A sessions.',
            'product_type' => 'one_time',
            'tier' => 'vip',
            'grants_vip_access' => true,
            'is_active' => true,
        ]);

        // Phase pricing for VIP Pass
        ProductPrice::create(['product_id' => $vipPass->id, 'summit_phase' => 'pre_summit', 'amount_cents' => 4700, 'compare_at_cents' => null]);
        ProductPrice::create(['product_id' => $vipPass->id, 'summit_phase' => 'late_pre_summit', 'amount_cents' => 7700, 'compare_at_cents' => 9700]);
        ProductPrice::create(['product_id' => $vipPass->id, 'summit_phase' => 'during_summit', 'amount_cents' => 9700, 'compare_at_cents' => 14700]);
        ProductPrice::create(['product_id' => $vipPass->id, 'summit_phase' => 'post_summit', 'amount_cents' => 14700, 'compare_at_cents' => null]);

        $recordingsBundle = Product::create([
            'summit_id' => $summit->id,
            'category_id' => $bundleCategory->id,
            'slug' => 'recordings-bundle',
            'name' => 'Recordings-Only Bundle',
            'description' => 'All speaker recordings without VIP perks.',
            'product_type' => 'one_time',
            'is_active' => true,
        ]);

        ProductPrice::create(['product_id' => $recordingsBundle->id, 'summit_phase' => 'pre_summit', 'amount_cents' => 2700]);
        ProductPrice::create(['product_id' => $recordingsBundle->id, 'summit_phase' => 'during_summit', 'amount_cents' => 3700]);
        ProductPrice::create(['product_id' => $recordingsBundle->id, 'summit_phase' => 'post_summit', 'amount_cents' => 4700]);

        $workbook = Product::create([
            'summit_id' => $summit->id,
            'slug' => 'summit-workbook',
            'name' => 'Summit Action Workbook',
            'description' => 'A guided workbook to help you apply the summit teachings.',
            'product_type' => 'one_time',
            'is_active' => true,
        ]);

        ProductPrice::create(['product_id' => $workbook->id, 'summit_phase' => 'pre_summit', 'amount_cents' => 1700]);
        ProductPrice::create(['product_id' => $workbook->id, 'summit_phase' => 'during_summit', 'amount_cents' => 1700]);
        ProductPrice::create(['product_id' => $workbook->id, 'summit_phase' => 'post_summit', 'amount_cents' => 1700]);

        // --- Funnels ---
        $preSummitFunnel = Funnel::create([
            'summit_id' => $summit->id,
            'slug' => 'pre-summit-47',
            'name' => 'Pre-Summit $47 Funnel',
            'target_phase' => 'pre_summit',
            'is_active' => true,
            'theme' => [
                'colors' => [
                    'primary' => '#6366f1',
                    'secondary' => '#1e1b4b',
                    'accent' => '#f59e0b',
                    'background' => '#ffffff',
                    'text' => '#111827',
                ],
                'fonts' => ['heading' => 'Plus Jakarta Sans', 'body' => 'Inter'],
                'logo_url' => null,
            ],
        ]);

        // Funnel Steps — using block-based content
        $optinStep = FunnelStep::create([
            'funnel_id' => $preSummitFunnel->id,
            'step_type' => 'optin',
            'slug' => 'register',
            'name' => 'Free Registration',
            'content' => ['blocks' => [
                ['type' => 'hero', 'data' => [
                    'headline' => 'Althea Wellness Summit 2025',
                    'subheadline' => 'Free Online Event • 30+ Expert Speakers',
                    'body' => '<p>Join thousands of health-conscious individuals for 5 days of transformative wellness content from world-leading experts.</p>',
                    'cta_text' => 'Register Free Now',
                    'style' => 'gradient',
                ]],
                ['type' => 'speaker_grid', 'data' => [
                    'heading' => 'Meet Your Speakers',
                    'subheading' => 'Learn from world-class wellness experts',
                    'columns' => '3',
                ]],
                ['type' => 'testimonials', 'data' => [
                    'heading' => 'What Past Attendees Say',
                    'items' => [
                        ['quote' => 'This summit completely changed my approach to wellness. The speakers were incredible.', 'name' => 'Maria L.', 'title' => 'Health Coach'],
                        ['quote' => 'I learned more in 5 days than in years of reading. Highly recommend!', 'name' => 'Tom K.', 'title' => 'Fitness Enthusiast'],
                        ['quote' => 'The VIP pass was worth every penny. I still rewatch the recordings.', 'name' => 'Sarah P.', 'title' => 'Nutritionist'],
                    ],
                ]],
                ['type' => 'faq', 'data' => [
                    'heading' => 'Frequently Asked Questions',
                    'items' => [
                        ['question' => 'Is the summit really free?', 'answer' => 'Yes! Registration is completely free. You get 24-hour access to each speaker video during the live event.'],
                        ['question' => 'What if I miss a session?', 'answer' => 'Each video is available for 24 hours after it airs. VIP pass holders get permanent access to all recordings.'],
                        ['question' => 'How do I watch the presentations?', 'answer' => 'After registering, you\'ll receive an email with your access link. Simply click to watch from any device.'],
                    ],
                ]],
                ['type' => 'cta', 'data' => [
                    'heading' => 'Ready to Transform Your Wellness?',
                    'subheading' => 'Join 10,000+ attendees at the Althea Wellness Summit',
                    'button_text' => 'Register Free Now',
                    'style' => 'dark',
                ]],
            ]],
            'sort_order' => 0,
            'is_published' => true,
        ]);

        $salesStep = FunnelStep::create([
            'funnel_id' => $preSummitFunnel->id,
            'step_type' => 'sales_page',
            'slug' => 'vip-offer',
            'name' => 'VIP Pass Offer',
            'content' => ['blocks' => [
                ['type' => 'hero', 'data' => [
                    'headline' => 'Upgrade to VIP All-Access',
                    'subheadline' => 'Limited Time Pre-Summit Price',
                    'body' => '<p>Get lifetime access to all 30+ masterclass recordings, exclusive Q&A sessions, downloadable resources, and bonus content.</p>',
                    'cta_text' => 'Get VIP Access — $47',
                    'style' => 'gradient',
                ]],
                ['type' => 'pricing_card', 'data' => [
                    'heading' => 'VIP All-Access Pass',
                    'subheading' => 'Lifetime access to everything',
                    'features' => [
                        ['text' => 'All 30+ masterclass recordings', 'included' => true],
                        ['text' => 'Exclusive Q&A sessions with speakers', 'included' => true],
                        ['text' => 'Downloadable resources & worksheets', 'included' => true],
                        ['text' => 'Bonus content & behind-the-scenes', 'included' => true],
                        ['text' => 'Community access', 'included' => true],
                    ],
                    'cta_text' => 'Get VIP Access Now',
                ]],
                ['type' => 'speaker_grid', 'data' => [
                    'heading' => 'Your VIP Speakers',
                    'columns' => '4',
                    'show_featured_only' => true,
                ]],
                ['type' => 'cta', 'data' => [
                    'heading' => 'Don\'t Miss This Price',
                    'subheading' => 'Price increases when the summit starts',
                    'button_text' => 'Get VIP Access — $47',
                    'style' => 'accent',
                ]],
            ]],
            'sort_order' => 1,
            'product_id' => $vipPass->id,
            'is_published' => true,
        ]);

        $checkoutStep = FunnelStep::create([
            'funnel_id' => $preSummitFunnel->id,
            'step_type' => 'checkout',
            'slug' => 'checkout',
            'name' => 'Secure Checkout',
            'content' => ['blocks' => [
                ['type' => 'checkout_form', 'data' => [
                    'heading' => 'Complete Your Order',
                    'subheading' => 'VIP All-Access Pass',
                    'button_text' => 'Complete Purchase',
                    'show_express_checkout' => true,
                ]],
            ]],
            'sort_order' => 2,
            'product_id' => $vipPass->id,
            'is_published' => true,
        ]);

        // Order bump on checkout
        FunnelStepBump::create([
            'funnel_step_id' => $checkoutStep->id,
            'product_id' => $workbook->id,
            'headline' => 'Summit Action Workbook',
            'description' => 'Apply what you learn with guided exercises and action plans for each masterclass.',
            'bullets' => [
                'Guided exercises for every masterclass',
                'Weekly action plans and reflection prompts',
                'Printable PDF — yours to keep forever',
            ],
            'checkbox_label' => 'Yes! Add the Summit Workbook for just $17',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $upsellStep = FunnelStep::create([
            'funnel_id' => $preSummitFunnel->id,
            'step_type' => 'upsell',
            'slug' => 'recordings-offer',
            'name' => 'Add Recordings Bundle',
            'content' => ['blocks' => [
                ['type' => 'countdown', 'data' => [
                    'heading' => 'This offer expires in...',
                    'minutes' => 15,
                    'expired_text' => 'This offer has expired.',
                ]],
                ['type' => 'upsell_offer', 'data' => [
                    'heading' => 'One More Thing…',
                    'subheading' => 'Special One-Time Offer',
                    'body' => '<p>Get all speaker recordings to watch at your own pace, forever.</p>',
                    'accept_text' => 'Yes — Add Recordings Bundle',
                    'decline_text' => 'No thanks, skip this offer',
                ]],
            ]],
            'sort_order' => 3,
            'product_id' => $recordingsBundle->id,
            'is_published' => true,
        ]);

        $thankYouStep = FunnelStep::create([
            'funnel_id' => $preSummitFunnel->id,
            'step_type' => 'thank_you',
            'slug' => 'thank-you',
            'name' => 'Thank You!',
            'content' => ['blocks' => [
                ['type' => 'hero', 'data' => [
                    'headline' => 'You\'re All Set!',
                    'subheadline' => 'Welcome to the Althea Wellness Summit 2025',
                    'body' => '<p>Check your email for your access details and summit schedule. We can\'t wait to see you there!</p>',
                    'style' => 'gradient',
                ]],
                ['type' => 'text', 'data' => [
                    'body' => '<h2>What Happens Next?</h2><ol><li>Check your email for your confirmation and access link</li><li>Mark your calendar for the summit dates</li><li>Join our community group for pre-summit discussions</li></ol>',
                    'width' => 'medium',
                ]],
            ]],
            'sort_order' => 4,
            'is_published' => true,
        ]);

        // --- Coupon ---
        Coupon::create([
            'code' => 'EARLYBIRD',
            'coupon_type' => 'percentage',
            'amount' => 20,
            'max_uses' => 100,
            'summit_id' => $summit->id,
            'starts_at' => now(),
            'expires_at' => now()->addDays(14),
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'FRIEND10',
            'coupon_type' => 'fixed_amount',
            'amount' => 1000,
            'summit_id' => $summit->id,
            'is_active' => true,
        ]);

        // --- Affiliate ---
        Affiliate::create([
            'code' => 'PARTNER01',
            'first_name' => 'Jane',
            'last_name' => 'Affiliate',
            'email' => 'jane@affiliates.com',
            'commission_rate' => 0.3000,
            'is_active' => true,
        ]);

        $this->command->info('Demo data seeded: summit, 6 speakers, 3 products with phase prices, funnel with 5 steps, order bump, 2 coupons, 1 affiliate.');
    }
}
