<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Livewire\Livewire;
use Tests\TestCase;
use Tiptap\Editor;

class EditFunnelStepHeadlineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Gate::before(fn () => true);
        $this->actingAs(User::factory()->admin()->create());

        $this->domain = Domain::create([
            'name' => 'Test Domain',
            'hostname' => 'edit-step-headline-test.localhost',
            'slug' => 'edit-step-headline-test',
            'is_active' => true,
        ]);
        Filament::setTenant($this->domain);
    }

    public function test_fill_splits_headline_into_rich_text(): void
    {
        $summit = Summit::factory()->create(['domain_id' => $this->domain->id]);
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => [
                'template_key' => 'cream-sage',
                'content' => [
                    'hero' => [
                        'headlineLead' => 'A ',
                        'headlineAccent' => 'gentle',
                        'headlineTrail' => ' summit.',
                    ],
                ],
            ],
        ]);

        $page = Livewire::test(EditFunnelStep::class, ['record' => $step->getRouteKey()]);

        // Builder uses UUID keys after afterStateHydrated; normalize to
        // sequential for inspection.
        $blocks = array_values($page->instance()->data['page_content'] ?? []);
        $hero = collect($blocks)->firstWhere('type', 'hero');

        $this->assertNotNull($hero, 'Hero block not found in builder list');
        $this->assertArrayHasKey('__headline', $hero['data'], '__headline key must be present');
        $this->assertArrayNotHasKey('headlineLead', $hero['data'], 'headlineLead must be gone from form state');
        $this->assertArrayNotHasKey('headlineAccent', $hero['data'], 'headlineAccent must be gone from form state');
        $this->assertArrayNotHasKey('headlineTrail', $hero['data'], 'headlineTrail must be gone from form state');

        // RichEditor stores TipTap JSON internally; convert back to HTML to
        // verify the round-trip produced the expected markup.
        $raw = $hero['data']['__headline'];
        if (is_array($raw)) {
            $raw = (new Editor)->setContent($raw)->getHTML();
        }
        $this->assertSame('<p>A <em>gentle</em> summit.</p>', $raw);
    }

    public function test_save_re_joins_rich_text_into_three_strings(): void
    {
        $summit = Summit::factory()->create(['domain_id' => $this->domain->id]);
        $funnel = Funnel::factory()->for($summit)->create();
        $step = FunnelStep::factory()->for($funnel)->create([
            'page_content' => [
                'template_key' => 'cream-sage',
                'content' => [
                    'hero' => [
                        'headlineLead' => 'old ',
                        'headlineAccent' => 'old',
                        'headlineTrail' => ' old',
                    ],
                ],
            ],
        ]);

        $page = Livewire::test(EditFunnelStep::class, ['record' => $step->getRouteKey()]);

        // Grab the current builder state (UUID-keyed), update the hero block's
        // __headline field, then set the whole array back and save.
        // RichEditor stores TipTap JSON internally, so convert HTML to TipTap
        // JSON before injecting into the form state.
        $newTiptap = (new Editor)->setContent('New <em>brilliant</em> headline.')->getDocument();
        $blocks = array_values($page->instance()->data['page_content'] ?? []);
        foreach ($blocks as &$block) {
            if (($block['type'] ?? null) === 'hero') {
                $block['data']['__headline'] = $newTiptap;
            }
        }
        unset($block);

        $page->set('data.page_content', $blocks)->call('save');

        $step->refresh();

        $this->assertSame('New ', $step->page_content['content']['hero']['headlineLead']);
        $this->assertSame('brilliant', $step->page_content['content']['hero']['headlineAccent']);
        $this->assertSame(' headline.', $step->page_content['content']['hero']['headlineTrail']);
    }
}
