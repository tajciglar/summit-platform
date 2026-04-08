<?php

namespace App\Policies;

use App\Models\User;

class SpeakerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view_speakers');
    }

    public function view(User $user): bool
    {
        return $user->can('view_speakers');
    }

    public function create(User $user): bool
    {
        return $user->can('create_speakers');
    }

    public function update(User $user): bool
    {
        return $user->can('edit_speakers');
    }

    public function delete(User $user): bool
    {
        return $user->can('delete_speakers');
    }
}
