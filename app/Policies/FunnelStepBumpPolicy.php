<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\FunnelStepBump;
use Illuminate\Auth\Access\HandlesAuthorization;

class FunnelStepBumpPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:FunnelStepBump');
    }

    public function view(AuthUser $authUser, FunnelStepBump $funnelStepBump): bool
    {
        return $authUser->can('View:FunnelStepBump');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:FunnelStepBump');
    }

    public function update(AuthUser $authUser, FunnelStepBump $funnelStepBump): bool
    {
        return $authUser->can('Update:FunnelStepBump');
    }

    public function delete(AuthUser $authUser, FunnelStepBump $funnelStepBump): bool
    {
        return $authUser->can('Delete:FunnelStepBump');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:FunnelStepBump');
    }

    public function restore(AuthUser $authUser, FunnelStepBump $funnelStepBump): bool
    {
        return $authUser->can('Restore:FunnelStepBump');
    }

    public function forceDelete(AuthUser $authUser, FunnelStepBump $funnelStepBump): bool
    {
        return $authUser->can('ForceDelete:FunnelStepBump');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:FunnelStepBump');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:FunnelStepBump');
    }

    public function replicate(AuthUser $authUser, FunnelStepBump $funnelStepBump): bool
    {
        return $authUser->can('Replicate:FunnelStepBump');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:FunnelStepBump');
    }

}