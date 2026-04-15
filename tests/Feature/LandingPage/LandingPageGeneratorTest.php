<?php

namespace Tests\Feature\LandingPage;

use App\Models\Summit;
use App\Services\Blocks\BlockCatalogService;
use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use App\Services\FunnelGenerator\Phases\CopywriterPhase;
use App\Services\LandingPageGenerator;
use Mockery;

it('returns flat block array with uuid ids', function () {
    $summit = Summit::factory()->create([
        'title'       => 'ADHD Parenting Summit',
        'description' => 'Transform your family.',
        'starts_at'   => '2026-03-09',
        'ends_at'     => '2026-03-13',
    ]);

    $fakeSequence = ['optin' => [['type' => 'HeroBlock', 'version' => 1]]];
    $fakeBlocks   = [['type' => 'HeroBlock', 'version' => 1, 'props' => ['headline' => 'Join us']]];

    $architect       = Mockery::mock(ArchitectPhase::class);
    $copywriter      = Mockery::mock(CopywriterPhase::class);
    $catalog         = Mockery::mock(BlockCatalogService::class);
    $blockDesignPhase = Mockery::mock(BlockDesignPhase::class);

    $catalog->shouldReceive('current')->once()->andReturn([]);

    $architect->shouldReceive('run')
        ->once()
        ->withArgs(fn ($brief, $cat, $steps) => $steps === ['optin'])
        ->andReturn($fakeSequence);

    $copywriter->shouldReceive('run')
        ->once()
        ->withArgs(fn ($brief, $cat, $stepType, $seq) => $stepType === 'optin')
        ->andReturn($fakeBlocks);

    $generator = new LandingPageGenerator($architect, $copywriter, $catalog, $blockDesignPhase);
    $blocks    = $generator->generate($summit, 'Focus on single parents.');

    expect($blocks)->toHaveCount(1);
    expect($blocks[0]['type'])->toBe('HeroBlock');
    expect($blocks[0])->toHaveKey('id');
    expect($blocks[0]['id'])->toMatch('/^[0-9a-f-]{36}$/');
});

it('passes summit context in brief', function () {
    $summit = Summit::factory()->create([
        'title'       => 'My Summit',
        'description' => 'Great content.',
        'starts_at'   => '2026-06-01',
        'ends_at'     => '2026-06-05',
    ]);

    $capturedBrief = null;

    $architect        = Mockery::mock(ArchitectPhase::class);
    $copywriter       = Mockery::mock(CopywriterPhase::class);
    $catalog          = Mockery::mock(BlockCatalogService::class);
    $blockDesignPhase = Mockery::mock(BlockDesignPhase::class);

    $catalog->shouldReceive('current')->andReturn([]);
    $architect->shouldReceive('run')
        ->withArgs(function ($brief) use (&$capturedBrief) {
            $capturedBrief = $brief;
            return true;
        })
        ->andReturn(['optin' => []]);
    $copywriter->shouldReceive('run')->andReturn([]);

    $generator = new LandingPageGenerator($architect, $copywriter, $catalog, $blockDesignPhase);
    $generator->generate($summit, 'Extra notes here.');

    expect($capturedBrief['summit_name'])->toBe('My Summit');
    expect($capturedBrief['notes'])->toBe('Extra notes here.');
});
