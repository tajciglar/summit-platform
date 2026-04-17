<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\FunnelStep;
use Illuminate\Auth\Access\HandlesAuthorization;

class FunnelStepPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:FunnelStep');
    }

    public function view(AuthUser $authUser, FunnelStep $funnelStep): bool
    {
        return $authUser->can('View:FunnelStep');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:FunnelStep');
    }

    public function update(AuthUser $authUser, FunnelStep $funnelStep): bool
    {
        return $authUser->can('Update:FunnelStep');
    }

    public function delete(AuthUser $authUser, FunnelStep $funnelStep): bool
    {
        return $authUser->can('Delete:FunnelStep');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:FunnelStep');
    }

    public function restore(AuthUser $authUser, FunnelStep $funnelStep): bool
    {
        return $authUser->can('Restore:FunnelStep');
    }

    public function forceDelete(AuthUser $authUser, FunnelStep $funnelStep): bool
    {
        return $authUser->can('ForceDelete:FunnelStep');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:FunnelStep');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:FunnelStep');
    }

    public function replicate(AuthUser $authUser, FunnelStep $funnelStep): bool
    {
        return $authUser->can('Replicate:FunnelStep');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:FunnelStep');
    }

}