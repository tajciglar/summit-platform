<?php

namespace App\Policies;

use App\Models\User;

class DomainPolicy
{
    public function viewAny(User $user): bool { return $user->can('view_domains'); }
    public function view(User $user): bool { return $user->can('view_domains'); }
    public function create(User $user): bool { return $user->can('create_domains'); }
    public function update(User $user): bool { return $user->can('edit_domains'); }
    public function delete(User $user): bool { return $user->can('delete_domains'); }
}
