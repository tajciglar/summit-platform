<?php

namespace Tests\Unit\Services\Templates;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
use App\Services\Templates\TemplateBlockFactory;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\RichEditor;
use Filament\Schemas\Components\Fieldset;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateBlockFactoryHeadlineTest extends TestCase
{
    use RefreshDatabase;

    public function test_headline_trio_collapses_to_one_rich_editor(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => ['template_key' => 'cream-sage', 'content' => []],
        ]);

        $blocks = app(TemplateBlockFactory::class)->blocksForStep($step);

        $hero = collect($blocks)->first(fn (Block $b) => $b->getName() === 'hero');
        $this->assertNotNull($hero, 'hero block must exist');

        $children = $hero->getDefaultChildComponents();
        $names = collect($children)->map(fn ($c) => $c->getName())->all();

        $this->assertContains('__headline', $names);
        $this->assertNotContains('headlineLead', $names);
        $this->assertNotContains('headlineAccent', $names);
        $this->assertNotContains('headlineTrail', $names);

        $headline = collect($children)->first(fn ($c) => $c->getName() === '__headline');
        $this->assertInstanceOf(RichEditor::class, $headline);
    }

    public function test_design_fieldset_is_removed(): void
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => ['template_key' => 'cream-sage', 'content' => []],
        ]);

        $blocks = app(TemplateBlockFactory::class)->blocksForStep($step);

        foreach ($blocks as $block) {
            $children = collect($block->getDefaultChildComponents());
            $designFieldsets = $children->filter(
                fn ($c) => $c instanceof Fieldset
                    && str_contains((string) $c->getLabel(), 'Design'),
            );
            $this->assertCount(0, $designFieldsets, "Block {$block->getName()} still has Design fieldset");
        }
    }
}
