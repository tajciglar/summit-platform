<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'ac_contact_id',
    ];

    public function optins(): HasMany
    {
        return $this->hasMany(Optin::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
