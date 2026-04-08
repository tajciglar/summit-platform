<?php

namespace App\Policies;

use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view_orders');
    }

    public function view(User $user): bool
    {
        return $user->can('view_orders');
    }

    public function create(User $user): bool
    {
        return false;
    } // orders created by system only

    public function update(User $user): bool
    {
        return false;
    }

    public function delete(User $user): bool
    {
        return false;
    }
}
