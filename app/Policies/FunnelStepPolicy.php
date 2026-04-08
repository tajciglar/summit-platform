<?php

namespace App\Policies;

use App\Models\User;

class FunnelStepPolicy
{
    public function viewAny(User $user): bool { return $user->can('view_funnel_steps'); }
    public function view(User $user): bool { return $user->can('view_funnel_steps'); }
    public function create(User $user): bool { return $user->can('create_funnel_steps'); }
    public function update(User $user): bool { return $user->can('edit_funnel_steps'); }
    public function delete(User $user): bool { return $user->can('delete_funnel_steps'); }
}
