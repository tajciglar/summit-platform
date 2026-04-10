<?php

namespace App\Filament\Pages;

use App\Models\ContentAccessGrant;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;

class ContentAccessAudit extends Page
{
    protected static \UnitEnum|string|null $navigationGroup = 'Analytics';

    protected static ?int $navigationSort = 3;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    protected static ?string $navigationLabel = 'Content Access Audit';

    protected static ?string $title = 'Content Access Audit';

    protected string $view = 'filament.pages.content-access-audit';

    #[\Livewire\Attributes\Url]
    public string $accessLevel = '';

    #[\Livewire\Attributes\Url]
    public string $search = '';

    #[\Livewire\Attributes\Url]
    public string $expiry = '';

    public function getViewData(): array
    {
        $query = ContentAccessGrant::with(['user', 'summit', 'order'])
            ->orderByDesc('granted_at');

        if ($this->accessLevel) {
            $query->where('access_level', $this->accessLevel);
        }

        if ($this->search) {
            $query->whereHas('user', function ($q) {
                $q->where('email', 'ilike', "%{$this->search}%")
                    ->orWhere('name', 'ilike', "%{$this->search}%");
            });
        }

        if ($this->expiry === 'expired') {
            $query->where('expires_at', '<', Carbon::now());
        } elseif ($this->expiry === 'active') {
            $query->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', Carbon::now());
            });
        } elseif ($this->expiry === 'never') {
            $query->whereNull('expires_at');
        }

        $grants = $query->paginate(50);

        // Stats
        $totalGrants = ContentAccessGrant::count();
        $vipGrants = ContentAccessGrant::where('access_level', 'vip')->count();
        $expiredGrants = ContentAccessGrant::whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->count();
        $activeGrants = $totalGrants - $expiredGrants;

        return [
            'grants' => $grants,
            'totalGrants' => $totalGrants,
            'vipGrants' => $vipGrants,
            'activeGrants' => $activeGrants,
            'expiredGrants' => $expiredGrants,
        ];
    }
}
