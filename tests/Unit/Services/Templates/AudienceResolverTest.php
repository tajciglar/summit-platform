<?php

declare(strict_types=1);

use App\Enums\SummitAudience;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Services\Templates\AudiencePalettes;
use App\Services\Templates\AudienceResolver;

it('uses batch audience_override when present', function () {
    $summit = new Summit;
    $summit->audience = SummitAudience::Herbal;

    $batch = new LandingPageBatch;
    $batch->audience_override = SummitAudience::AdhdWomen;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver;
    $palette = $resolver->resolveForBatch($batch);

    expect($palette)->toBe(AudiencePalettes::PALETTES['adhd-women']);
});

it('falls back to summit audience when batch has no override', function () {
    $summit = new Summit;
    $summit->audience = SummitAudience::Herbal;

    $batch = new LandingPageBatch;
    $batch->audience_override = null;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver;
    $palette = $resolver->resolveForBatch($batch);

    expect($palette)->toBe(AudiencePalettes::PALETTES['herbal']);
});

it('falls back to NEUTRAL when neither batch nor summit has audience', function () {
    $summit = new Summit;
    $summit->audience = null;

    $batch = new LandingPageBatch;
    $batch->audience_override = null;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver;
    $palette = $resolver->resolveForBatch($batch);

    expect($palette)->toBe(AudiencePalettes::NEUTRAL);
});

it('resolveEnum returns the enum that applies to the batch (or null)', function () {
    $summit = new Summit;
    $summit->audience = SummitAudience::Menopause;

    $batch = new LandingPageBatch;
    $batch->audience_override = SummitAudience::Ai;
    $batch->setRelation('summit', $summit);

    $resolver = new AudienceResolver;
    expect($resolver->resolveEnum($batch))->toBe(SummitAudience::Ai);

    $batch->audience_override = null;
    expect($resolver->resolveEnum($batch))->toBe(SummitAudience::Menopause);

    $summit->audience = null;
    expect($resolver->resolveEnum($batch))->toBeNull();
});
