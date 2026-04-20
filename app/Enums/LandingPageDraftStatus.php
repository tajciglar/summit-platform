<?php

namespace App\Enums;

enum LandingPageDraftStatus: string
{
    case Queued = 'queued';
    case Generating = 'generating';
    case Ready = 'ready';
    case Publishing = 'publishing';
    case Shortlisted = 'shortlisted';
    case Published = 'published';
    case Failed = 'failed';
    case Archived = 'archived';

    public function badgeColor(): string
    {
        return match ($this) {
            self::Published => 'success',
            self::Ready, self::Shortlisted => 'info',
            self::Queued, self::Generating, self::Publishing => 'warning',
            self::Failed => 'danger',
            self::Archived => 'gray',
        };
    }

    public function isPublishable(): bool
    {
        return match ($this) {
            self::Ready, self::Shortlisted => true,
            default => false,
        };
    }

    public function isDeletable(): bool
    {
        return ! in_array($this, [self::Generating, self::Publishing], true);
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
