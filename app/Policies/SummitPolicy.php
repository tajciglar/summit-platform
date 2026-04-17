<?php

declare(strict_types=1);

namespace App\Policies;

use Illuminate\Foundation\Auth\User as AuthUser;
use App\Models\Summit;
use Illuminate\Auth\Access\HandlesAuthorization;

class SummitPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:Summit');
    }

    public function view(AuthUser $authUser, Summit $summit): bool
    {
        return $authUser->can('View:Summit');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:Summit');
    }

    public function update(AuthUser $authUser, Summit $summit): bool
    {
        return $authUser->can('Update:Summit');
    }

    public function delete(AuthUser $authUser, Summit $summit): bool
    {
        return $authUser->can('Delete:Summit');
    }

    public function deleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('DeleteAny:Summit');
    }

    public function restore(AuthUser $authUser, Summit $summit): bool
    {
        return $authUser->can('Restore:Summit');
    }

    public function forceDelete(AuthUser $authUser, Summit $summit): bool
    {
        return $authUser->can('ForceDelete:Summit');
    }

    public function forceDeleteAny(AuthUser $authUser): bool
    {
        return $authUser->can('ForceDeleteAny:Summit');
    }

    public function restoreAny(AuthUser $authUser): bool
    {
        return $authUser->can('RestoreAny:Summit');
    }

    public function replicate(AuthUser $authUser, Summit $summit): bool
    {
        return $authUser->can('Replicate:Summit');
    }

    public function reorder(AuthUser $authUser): bool
    {
        return $authUser->can('Reorder:Summit');
    }

}