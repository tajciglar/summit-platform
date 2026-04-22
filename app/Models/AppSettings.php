<?php

namespace App\Models;

use App\Models\Concerns\HasMediaAttachments;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class AppSettings extends Model
{
    use HasMediaAttachments, HasUuid;

    protected $table = 'app_settings';

    protected $fillable = [
        'company_name',
        'support_email',
        'sender_name',
        'sender_email',
        'default_currency',
        'stripe_publishable_key',
        'activecampaign_list_id',
        'brand_color',
    ];

    /**
     * Always returns the single settings row, creating it on first access.
     */
    public static function current(): self
    {
        return self::query()->first() ?? self::create([]);
    }
}
