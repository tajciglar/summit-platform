<?php

namespace App\Filament\Pages\Concerns;

use App\Support\CurrentSummit;

/**
 * For CreateRecord pages under resources that scope via
 * ScopesTenantViaSummitDomains. The Summit select on the form is hidden
 * when an admin has picked a specific summit in the tenant dropdown, and
 * Filament hidden fields do not dehydrate — so summit_id drops out of the
 * submit payload and the NOT NULL insert fails. Inject it here as a belt
 * so create always has the correct summit id.
 */
trait InjectsCurrentSummitOnCreate
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        if (empty($data['summit_id']) && ($summitId = CurrentSummit::getId())) {
            $data['summit_id'] = $summitId;
        }

        return $data;
    }
}
