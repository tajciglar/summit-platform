<?php

namespace Tests\Unit;

use App\Models\Funnel;
use App\Models\Summit;
use App\Services\StyleBrief\DefaultStyleBrief;
use App\Services\StyleBrief\StyleBriefResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StyleBriefResolverTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_default_when_summit_has_none(): void
    {
        $summit = Summit::factory()->create(['style_brief' => null]);
        $funnel = Funnel::factory()->for($summit)->create(['style_brief_override' => null]);

        $brief = (new StyleBriefResolver)->resolveForFunnel($funnel);

        $default = DefaultStyleBrief::get();
        $this->assertSame($default['palette']['primary'], $brief['palette']['primary']);
        $this->assertSame($default['hero_pattern'], $brief['hero_pattern']);
    }

    public function test_funnel_override_deep_merges_summit_base(): void
    {
        $summit = Summit::factory()->create([
            'style_brief' => [
                'palette' => ['primary' => '#111111'],
            ],
        ]);
        $funnel = Funnel::factory()->for($summit)->create([
            'style_brief_override' => [
                'palette' => ['accent' => '#22ff22'],
            ],
        ]);

        $brief = (new StyleBriefResolver)->resolveForFunnel($funnel);

        $this->assertSame('#111111', $brief['palette']['primary']);
        $this->assertSame('#22ff22', $brief['palette']['accent']);
        $this->assertSame('#ffffff', $brief['palette']['background']);
    }

    public function test_null_funnel_returns_default(): void
    {
        $brief = (new StyleBriefResolver)->resolveForFunnel(null);
        $this->assertSame('#704fe6', $brief['palette']['primary']);
    }

    public function test_resolve_for_summit_merges_only_base(): void
    {
        $summit = Summit::factory()->create([
            'style_brief' => ['palette' => ['primary' => '#abcdef']],
        ]);
        $brief = (new StyleBriefResolver)->resolveForSummit($summit);
        $this->assertSame('#abcdef', $brief['palette']['primary']);
        $this->assertSame('Poppins', $brief['typography']['heading_font']);
    }
}
