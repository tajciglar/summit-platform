<?php

namespace App\Policies;

use App\Models\User;

class FunnelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view_funnels');
    }

    public function view(User $user): bool
    {
        return $user->can('view_funnels');
    }

    public function create(User $user): bool
    {
        return $user->can('create_funnels');
    }

    public function update(User $user): bool
    {
        return $user->can('edit_funnels');
    }

    public function delete(User $user): bool
    {
        return $user->can('delete_funnels');
    }
}
