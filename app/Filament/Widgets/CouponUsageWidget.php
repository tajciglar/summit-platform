<?php

namespace App\Filament\Widgets;

use App\Models\Coupon;
use App\Models\Order;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class CouponUsageWidget extends Widget
{
    protected static ?int $sort = 5;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.coupon-usage';

    public function getData(): Collection
    {
        return Coupon::withCount('orders')
            ->withSum('orders as revenue_cents', 'total_cents')
            ->withSum('orders as discount_cents_sum', 'discount_cents')
            ->orderByDesc('orders_count')
            ->limit(10)
            ->get()
            ->map(fn (Coupon $c) => [
                'code' => $c->code,
                'type' => $c->coupon_type === 'percentage' ? "{$c->amount}% off" : '$' . number_format($c->amount / 100, 2) . ' off',
                'uses' => $c->orders_count,
                'max_uses' => $c->max_uses ?? '∞',
                'revenue' => ($c->revenue_cents ?? 0) / 100,
                'discount_given' => ($c->discount_cents_sum ?? 0) / 100,
                'is_active' => $c->isValid(),
                'summit' => $c->summit?->title,
                'expires_at' => $c->expires_at?->format('M d, Y'),
            ]);
    }
}
