<?php

use App\Enums\LandingPageDraftStatus;

it('has all known statuses', function () {
    $values = array_map(fn ($c) => $c->value, LandingPageDraftStatus::cases());
    sort($values);

    expect($values)->toBe([
        'archived', 'failed', 'generating', 'published',
        'publishing', 'queued', 'ready', 'shortlisted',
    ]);
});

it('has correct badge color mapping', function () {
    expect(LandingPageDraftStatus::Published->badgeColor())->toBe('success')
        ->and(LandingPageDraftStatus::Ready->badgeColor())->toBe('info')
        ->and(LandingPageDraftStatus::Shortlisted->badgeColor())->toBe('info')
        ->and(LandingPageDraftStatus::Queued->badgeColor())->toBe('warning')
        ->and(LandingPageDraftStatus::Generating->badgeColor())->toBe('warning')
        ->and(LandingPageDraftStatus::Publishing->badgeColor())->toBe('warning')
        ->and(LandingPageDraftStatus::Failed->badgeColor())->toBe('danger')
        ->and(LandingPageDraftStatus::Archived->badgeColor())->toBe('gray');
});

it('is publishable only for ready and shortlisted', function () {
    expect(LandingPageDraftStatus::Ready->isPublishable())->toBeTrue()
        ->and(LandingPageDraftStatus::Shortlisted->isPublishable())->toBeTrue()
        ->and(LandingPageDraftStatus::Queued->isPublishable())->toBeFalse()
        ->and(LandingPageDraftStatus::Generating->isPublishable())->toBeFalse()
        ->and(LandingPageDraftStatus::Publishing->isPublishable())->toBeFalse()
        ->and(LandingPageDraftStatus::Published->isPublishable())->toBeFalse()
        ->and(LandingPageDraftStatus::Failed->isPublishable())->toBeFalse()
        ->and(LandingPageDraftStatus::Archived->isPublishable())->toBeFalse();
});

it('is not deletable when in-flight', function () {
    expect(LandingPageDraftStatus::Generating->isDeletable())->toBeFalse()
        ->and(LandingPageDraftStatus::Publishing->isDeletable())->toBeFalse()
        ->and(LandingPageDraftStatus::Ready->isDeletable())->toBeTrue()
        ->and(LandingPageDraftStatus::Failed->isDeletable())->toBeTrue()
        ->and(LandingPageDraftStatus::Archived->isDeletable())->toBeTrue();
});
