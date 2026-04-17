<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Speaker;
use Illuminate\Auth\Access\HandlesAuthorization;

class SpeakerPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Speaker');
    }

    public function view(AuthUser $authUser, Speaker $speaker): bool
    {
        return $authUser->can('View:Speaker');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Speaker');
    }

    public function update(AuthUser $authUser, Speaker $speaker): bool
    {
        return $authUser->can('Update:Speaker');
    }

    public function delete(AuthUser $authUser, Speaker $speaker): bool
    {
        return $authUser->can('Delete:Speaker');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:Speaker');
    }

    public function restore(AuthUser $authUser, Speaker $speaker): bool
    {
        return $authUser->can('Restore:Speaker');
    }

    public function forceDelete(AuthUser $authUser, Speaker $speaker): bool
    {
        return $authUser->can('ForceDelete:Speaker');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Speaker');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Speaker');
    }

    public function replicate(AuthUser $authUser, Speaker $speaker): bool
    {
        return $authUser->can('Replicate:Speaker');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Speaker');
    }

}