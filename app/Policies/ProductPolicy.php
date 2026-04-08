<?php

namespace App\Policies;

use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool { return $user->can('view_products'); }
    public function view(User $user): bool { return $user->can('view_products'); }
    public function create(User $user): bool { return $user->can('create_products'); }
    public function update(User $user): bool { return $user->can('edit_products'); }
    public function delete(User $user): bool { return $user->can('delete_products'); }
}
