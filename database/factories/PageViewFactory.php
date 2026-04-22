<?php

namespace Database\Factories;

use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PageView>
 */
class PageViewFactory extends Factory
{
    protected $model = PageView::class;

    public function definition(): array
    {
        return [
            'summit_id' => Summit::factory(),
            'page_url' => fake()->url(),
            'page_type' => 'optin',
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
