<?php

namespace App\Filament\Resources\Domains\Pages;

use App\Filament\Resources\Domains\DomainResource;
use App\Models\Domain;
use App\Models\User;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;

class CreateDomain extends CreateRecord
{
    protected static string $resource = DomainResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('edit', ['record' => $this->record]);
    }

    /**
     * Filament uses Domain as a tenant and filters the tenant dropdown via the
     * `domain_user` pivot. Without auto-attaching the creator, an operator who
     * spins up a new Domain can't switch to it — they have no pivot row. Wire
     * up the pivot on create so the domain shows up in their tenant dropdown
     * immediately.
     */
    protected function afterCreate(): void
    {
        /** @var Domain $domain */
        $domain = $this->record;
        $user = Filament::auth()->user();
        if ($user instanceof User) {
            $domain->users()->syncWithoutDetaching([$user->id => ['created_at' => now()]]);
        }
    }
}
