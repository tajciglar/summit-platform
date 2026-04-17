<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Funnel;
use Illuminate\Auth\Access\HandlesAuthorization;

class FunnelPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Funnel');
    }

    public function view(AuthUser $authUser, Funnel $funnel): bool
    {
        return $authUser->can('View:Funnel');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Funnel');
    }

    public function update(AuthUser $authUser, Funnel $funnel): bool
    {
        return $authUser->can('Update:Funnel');
    }

    public function delete(AuthUser $authUser, Funnel $funnel): bool
    {
        return $authUser->can('Delete:Funnel');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:Funnel');
    }

    public function restore(AuthUser $authUser, Funnel $funnel): bool
    {
        return $authUser->can('Restore:Funnel');
    }

    public function forceDelete(AuthUser $authUser, Funnel $funnel): bool
    {
        return $authUser->can('ForceDelete:Funnel');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Funnel');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Funnel');
    }

    public function replicate(AuthUser $authUser, Funnel $funnel): bool
    {
        return $authUser->can('Replicate:Funnel');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Funnel');
    }

}