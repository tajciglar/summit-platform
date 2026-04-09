<?php

namespace Database\Seeders;

use App\Models\ChecklistTemplateItem;
use App\Models\SummitChecklistTemplate;
use Illuminate\Database\Seeder;

class ChecklistTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $template = SummitChecklistTemplate::updateOrCreate(
            ['is_default' => true],
            [
                'name' => 'Default Summit Checklist',
                'description' => 'Standard checklist for summit launches — covers all page types, program pages, upgrades, checkouts, and community links.',
            ]
        );

        // Clear existing items for idempotency
        $template->items()->delete();

        $items = $this->getTemplateItems();
        $sortOrder = 0;

        foreach ($items as $item) {
            ChecklistTemplateItem::create([
                'template_id' => $template->id,
                'category' => $item['category'],
                'name' => $item['name'],
                'page_type' => $item['page_type'] ?? null,
                'sort_order' => $sortOrder++,
                'default_tags' => $item['default_tags'] ?? [],
            ]);
        }
    }

    protected function getTemplateItems(): array
    {
        return [
            // Core Pages
            ['category' => 'core_pages', 'name' => 'Opt-in Page', 'page_type' => 'optin', 'default_tags' => ['SIGNUP']],
            ['category' => 'core_pages', 'name' => 'OTO1 Page - VIP Pass', 'page_type' => 'upsell', 'default_tags' => ['VIP']],
            ['category' => 'core_pages', 'name' => 'Checkout OTO1 Page - VIP Pass', 'page_type' => 'checkout'],
            ['category' => 'core_pages', 'name' => 'Bump 1 - Product Name', 'page_type' => 'bump'],
            ['category' => 'core_pages', 'name' => 'Bump 2 - Product Name', 'page_type' => 'bump'],
            ['category' => 'core_pages', 'name' => 'Upsell - Upsell Name', 'page_type' => 'upsell', 'default_tags' => ['UPSELL']],
            ['category' => 'core_pages', 'name' => 'Thank You Page - Optin', 'page_type' => 'thank_you'],
            ['category' => 'core_pages', 'name' => 'Thank You Page - VIP', 'page_type' => 'thank_you'],
            ['category' => 'core_pages', 'name' => 'Sign-up Bonus Page/Link', 'page_type' => 'bonuses'],
            ['category' => 'core_pages', 'name' => 'VIP Bonus Page/Link', 'page_type' => 'bonuses'],
            ['category' => 'core_pages', 'name' => 'Schedule Link'],
            ['category' => 'core_pages', 'name' => 'Already attended VIP $97 offer'],
            ['category' => 'core_pages', 'name' => 'Upgrade Page - VIP Pass', 'page_type' => 'upgrade', 'default_tags' => ['VIP']],
            ['category' => 'core_pages', 'name' => 'Checkout Upgrade Page - VIP Pass', 'page_type' => 'checkout'],
            ['category' => 'core_pages', 'name' => 'Thank You Page - Upgrade', 'page_type' => 'thank_you'],

            // Program Pages - Free Signup
            ['category' => 'program_pages', 'name' => 'Day 1 Program Page (Free Signup)', 'page_type' => 'program'],
            ['category' => 'program_pages', 'name' => 'Day 2 Program Page (Free Signup)', 'page_type' => 'program'],
            ['category' => 'program_pages', 'name' => 'Day 3 Program Page (Free Signup)', 'page_type' => 'program'],
            // Program Pages - Free Closed
            ['category' => 'program_pages', 'name' => 'Day 1 Closed Program Page', 'page_type' => 'program'],
            ['category' => 'program_pages', 'name' => 'Day 2 Closed Program Page', 'page_type' => 'program'],
            ['category' => 'program_pages', 'name' => 'Day 3 Closed Program Page', 'page_type' => 'program'],
            // Program Pages - VIP
            ['category' => 'program_pages', 'name' => 'Day 1 VIP Program Page', 'page_type' => 'program'],
            ['category' => 'program_pages', 'name' => 'Day 2 VIP Program Page', 'page_type' => 'program'],
            ['category' => 'program_pages', 'name' => 'Day 3 VIP Program Page', 'page_type' => 'program'],

            // Upgrade Pages (self-sorting VIP PASS with products)
            ['category' => 'upgrade_pages', 'name' => 'Day 1 Upgrade - Product Name', 'page_type' => 'upgrade'],
            ['category' => 'upgrade_pages', 'name' => 'Day 2 Upgrade - Product Name', 'page_type' => 'upgrade'],
            ['category' => 'upgrade_pages', 'name' => 'Day 3 Upgrade - Product Name', 'page_type' => 'upgrade'],
            // Upgrade Pages - VIP $77
            ['category' => 'upgrade_pages', 'name' => 'Upgrade Page - VIP Pass $77', 'page_type' => 'upgrade', 'default_tags' => ['VIP']],
            ['category' => 'upgrade_pages', 'name' => 'Checkout Upgrade - VIP $77', 'page_type' => 'checkout'],
            ['category' => 'upgrade_pages', 'name' => 'Thank You Page - Upgrade $77', 'page_type' => 'thank_you'],
            // Upgrade Pages - VIP $97
            ['category' => 'upgrade_pages', 'name' => 'Upgrade Page - VIP Pass $97', 'page_type' => 'upgrade', 'default_tags' => ['VIP']],
            ['category' => 'upgrade_pages', 'name' => 'Checkout Upgrade - VIP $97', 'page_type' => 'checkout'],
            ['category' => 'upgrade_pages', 'name' => 'Thank You Page - Upgrade $97', 'page_type' => 'thank_you'],
            // Upgrade Pages - VIP $147
            ['category' => 'upgrade_pages', 'name' => 'Upgrade Page - VIP Pass $147', 'page_type' => 'upgrade', 'default_tags' => ['VIP']],
            ['category' => 'upgrade_pages', 'name' => 'Checkout Upgrade - VIP $147', 'page_type' => 'checkout'],
            ['category' => 'upgrade_pages', 'name' => 'Thank You Page - Upgrade $147', 'page_type' => 'thank_you'],

            // Checkout Pages (VIP + Product)
            ['category' => 'checkout_pages', 'name' => 'Day 1 - VIP & Product Checkout', 'page_type' => 'checkout'],
            ['category' => 'checkout_pages', 'name' => 'Day 2 - VIP & Product Checkout', 'page_type' => 'checkout'],
            ['category' => 'checkout_pages', 'name' => 'Day 3 - VIP & Product Checkout', 'page_type' => 'checkout'],
            // Checkout Pages (VIP Only)
            ['category' => 'checkout_pages', 'name' => 'Day 1 - VIP Checkout', 'page_type' => 'checkout', 'default_tags' => ['VIP']],
            ['category' => 'checkout_pages', 'name' => 'Day 2 - VIP Checkout', 'page_type' => 'checkout', 'default_tags' => ['VIP']],
            ['category' => 'checkout_pages', 'name' => 'Day 3 - VIP Checkout', 'page_type' => 'checkout', 'default_tags' => ['VIP']],
            // Checkout Pages (Downsell)
            ['category' => 'checkout_pages', 'name' => 'Downsell 1 - Add Product', 'page_type' => 'downsell'],
            ['category' => 'checkout_pages', 'name' => 'Downsell 2 - Add Product', 'page_type' => 'downsell'],
            ['category' => 'checkout_pages', 'name' => 'Bump 1 - Add Product', 'page_type' => 'bump'],
            ['category' => 'checkout_pages', 'name' => 'Bump 2 - Add Product', 'page_type' => 'bump'],

            // Circle Links
            ['category' => 'circle_links', 'name' => 'Circle Community Link'],
        ];
    }
}
