<?php

namespace App\Filament\Pages;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class AffiliateDashboard extends Page
{
    protected static \UnitEnum|string|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserPlus;

    protected static ?string $navigationLabel = 'Affiliate Dashboard';

    protected static ?string $title = 'Affiliate Performance';

    protected string $view = 'filament.pages.affiliate-dashboard';

    public function getViewData(): array
    {
        $now = Carbon::now();

        // Global stats
        $totalCommissions = AffiliateCommission::sum('commission_cents');
        $pendingCommissions = AffiliateCommission::where('status', 'pending')->sum('commission_cents');
        $paidCommissions = AffiliateCommission::where('status', 'paid')->sum('commission_cents');
        $thisMonthCommissions = AffiliateCommission::where('created_at', '>=', $now->copy()->startOfMonth())
            ->sum('commission_cents');

        // Top affiliates
        $topAffiliates = Affiliate::where('is_active', true)
            ->withCount('orders')
            ->withSum('commissions as total_commission_cents', 'commission_cents')
            ->withSum(['commissions as pending_cents' => fn ($q) => $q->where('status', 'pending')], 'commission_cents')
            ->withCount('referrals')
            ->orderByDesc('total_commission_cents')
            ->limit(15)
            ->get()
            ->map(fn (Affiliate $a) => [
                'name' => $a->full_name,
                'email' => $a->email,
                'code' => $a->code,
                'referrals' => $a->referrals_count,
                'orders' => $a->orders_count,
                'conversion' => $a->referrals_count > 0 ? round(($a->orders_count / $a->referrals_count) * 100, 1) : 0,
                'total_earned' => ($a->total_commission_cents ?? 0) / 100,
                'pending' => ($a->pending_cents ?? 0) / 100,
                'rate' => $a->commission_rate * 100,
            ]);

        // Recent commissions
        $recentCommissions = AffiliateCommission::with(['affiliate', 'order'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return [
            'totalCommissions' => $totalCommissions / 100,
            'pendingCommissions' => $pendingCommissions / 100,
            'paidCommissions' => $paidCommissions / 100,
            'thisMonthCommissions' => $thisMonthCommissions / 100,
            'topAffiliates' => $topAffiliates,
            'recentCommissions' => $recentCommissions,
            'activeAffiliates' => Affiliate::where('is_active', true)->count(),
        ];
    }
}
