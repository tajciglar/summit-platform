<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Product;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        $summit = Summit::factory()->create([
            'slug' => 'adhd-parenting-summit-2026',
            'title' => 'ADHD Parenting Summit 2026',
            'topic' => 'ADHD parenting',
            'description' => 'A 5-day virtual summit for parents navigating ADHD.',
            'status' => 'published',
            'current_phase' => 'pre',
        ]);

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

        $funnel = Funnel::factory()->create([
            'summit_id' => $summit->id,
            'slug' => 'main-optin',
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
                'funnel_id' => $funnel->id,
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
        $this->command?->info("Admin login: admin@example.test / password");
    }
}
