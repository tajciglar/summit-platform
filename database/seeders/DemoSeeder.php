<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.test'],
            [
                'password' => Hash::make('password'),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'role' => 'admin',
                'is_active' => true,
            ],
        );

        // Three brand domains — the tenant switcher lists these.
        $parentingSummits = Domain::create([
            'name' => 'Parenting Summits',
            'hostname' => 'parenting-summits.com',
            'slug' => 'parenting-summits',
            'brand_color' => '#4F46E5',
            'is_active' => true,
        ]);

        $vzgoja = Domain::create([
            'name' => 'Vzgoja',
            'hostname' => 'vzgoja.si',
            'slug' => 'vzgoja',
            'brand_color' => '#10B981',
            'is_active' => true,
        ]);

        $althea = Domain::create([
            'name' => 'Althea Academy',
            'hostname' => 'althea-academy.com',
            'slug' => 'althea-academy',
            'brand_color' => '#EC4899',
            'is_active' => true,
        ]);

        // Admin can operate on all three brand domains.
        $admin->domains()->syncWithoutDetaching([
            $parentingSummits->id,
            $vzgoja->id,
            $althea->id,
        ]);

        $summit = Summit::factory()->create([
            'domain_id' => $parentingSummits->id,
            'slug' => 'adhd-parenting-summit-2026',
            'title' => 'ADHD Parenting Summit 2026',
            'topic' => 'ADHD parenting',
            'description' => 'A 5-day virtual summit for parents navigating ADHD.',
            'status' => 'published',
            'current_phase' => 'pre',
        ]);

        // Legacy pivot (kept for back-compat).
        $admin->summits()->syncWithoutDetaching([$summit->id]);

        // Second demo summit so the tenant switcher has something to switch to.
        $secondSummit = Summit::factory()->create([
            'domain_id' => $vzgoja->id,
            'slug' => 'productivity-summit-2026',
            'title' => 'Productivity Summit 2026',
            'topic' => 'productivity',
            'description' => 'A 3-day virtual summit on focus and deep work.',
            'status' => 'draft',
            'current_phase' => 'pre',
        ]);
        $admin->summits()->syncWithoutDetaching([$secondSummit->id]);

        Speaker::factory()->count(4)->create(['summit_id' => $secondSummit->id]);

        Speaker::factory()->count(8)->create(['summit_id' => $summit->id]);

        $vipPass = Product::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'vip-pass',
            'name' => 'VIP All-Access Pass',
            'category' => 'vip_pass',
            'tier' => 'vip',
            'grants_vip_access' => true,
            'price_pre_summit_cents' => 9700,
            'price_late_pre_cents' => 14700,
            'price_during_cents' => 19700,
            'price_post_summit_cents' => 24700,
        ]);

        $recordings = Product::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'session-recordings',
            'name' => 'Session Recordings',
            'category' => 'recording',
            'tier' => 'basic',
            'grants_vip_access' => false,
            'price_pre_summit_cents' => 4700,
            'price_late_pre_cents' => 6700,
            'price_during_cents' => 9700,
            'price_post_summit_cents' => 12700,
        ]);

        // Primary opt-in funnel: aps (ADHD Parenting Summit initials).
        $optinFunnel = Funnel::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'aps',
            'name' => 'Main Opt-in Funnel',
            'target_phase' => 'pre',
        ]);

        foreach ([
            ['step_type' => 'optin', 'name' => 'Registration', 'slug' => 'register', 'sort_order' => 0],
            ['step_type' => 'thank_you', 'name' => 'Thank You', 'slug' => 'thank-you', 'sort_order' => 1],
            ['step_type' => 'upsell', 'name' => 'VIP Upsell', 'slug' => 'vip-upsell', 'sort_order' => 2, 'product_id' => $vipPass->id],
            ['step_type' => 'thank_you', 'name' => 'Confirmation', 'slug' => 'confirmation', 'sort_order' => 3],
        ] as $step) {
            FunnelStep::factory()->create([
                'funnel_id' => $optinFunnel->id,
                ...$step,
                'page_content' => [],
            ]);
        }

        // Sales page funnel for the VIP pass — late-pre pushes the urgency angle.
        $salesFunnel = Funnel::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'aps-sales',
            'name' => 'VIP Sales Page',
            'target_phase' => 'late_pre',
        ]);
        foreach ([
            ['step_type' => 'sales_page', 'name' => 'VIP Pitch', 'slug' => 'vip', 'sort_order' => 0, 'product_id' => $vipPass->id],
            ['step_type' => 'checkout', 'name' => 'Checkout', 'slug' => 'checkout', 'sort_order' => 1, 'product_id' => $vipPass->id],
            ['step_type' => 'thank_you', 'name' => 'Thank You', 'slug' => 'thank-you', 'sort_order' => 2],
        ] as $step) {
            FunnelStep::factory()->create([
                'funnel_id' => $salesFunnel->id,
                ...$step,
                'page_content' => [],
            ]);
        }

        // Recordings upsell funnel, runs during & post summit.
        $recordingsFunnel = Funnel::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'aps-recordings',
            'name' => 'Recordings Offer',
            'target_phase' => 'during',
        ]);
        foreach ([
            ['step_type' => 'sales_page', 'name' => 'Recordings Pitch', 'slug' => 'pitch', 'sort_order' => 0, 'product_id' => $recordings->id],
            ['step_type' => 'checkout', 'name' => 'Checkout', 'slug' => 'checkout', 'sort_order' => 1, 'product_id' => $recordings->id],
            ['step_type' => 'thank_you', 'name' => 'Thank You', 'slug' => 'thank-you', 'sort_order' => 2],
        ] as $step) {
            FunnelStep::factory()->create([
                'funnel_id' => $recordingsFunnel->id,
                ...$step,
                'page_content' => [],
            ]);
        }

        // Post-summit last-chance funnel — late buyers, replay window.
        $lastChanceFunnel = Funnel::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'aps-last-chance',
            'name' => 'Last Chance Offer',
            'target_phase' => 'post',
        ]);
        foreach ([
            ['step_type' => 'sales_page', 'name' => 'Last Chance', 'slug' => 'last-chance', 'sort_order' => 0, 'product_id' => $vipPass->id],
            ['step_type' => 'checkout', 'name' => 'Checkout', 'slug' => 'checkout', 'sort_order' => 1, 'product_id' => $vipPass->id],
            ['step_type' => 'thank_you', 'name' => 'Thank You', 'slug' => 'thank-you', 'sort_order' => 2],
        ] as $step) {
            FunnelStep::factory()->create([
                'funnel_id' => $lastChanceFunnel->id,
                ...$step,
                'page_content' => [],
            ]);
        }

        Coupon::create([
            'code' => 'EARLY25',
            'coupon_type' => 'percentage',
            'amount' => 25,
            'max_uses' => 100,
            'times_used' => 0,
            'summit_id' => $summit->id,
            'is_active' => true,
        ]);

        $this->command?->info('Demo data seeded.');
        $this->command?->info('Admin login: admin@example.test / password');
    }
}
