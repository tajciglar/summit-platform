<?php

use App\Filament\Resources\Funnels\Pages\CreateFunnel;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Domain;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Models\User;
use App\Services\Templates\TemplateRegistry;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->tenant = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'create-funnel-test.localhost',
        'slug' => 'create-funnel-test',
        'is_active' => true,
    ]);
    Filament::setTenant($this->tenant);

    $this->summit = Summit::factory()->create(['domain_id' => $this->tenant->id]);
});

it('seeds steps with empty page_content and dispatches no AI jobs', function () {
    Queue::fake();

    livewire(CreateFunnel::class)
        ->fillForm([
            'summit_id' => $this->summit->id,
            'name' => 'Test Funnel',
            'slug' => 'tf',
            'template_key' => 'ochre-ink',
            'wp_checkout_redirect_url' => 'https://wp.example.com/checkout',
            'wp_thankyou_redirect_url' => 'https://wp.example.com/thank-you',
            'steps_to_create' => ['optin', 'sales_page'],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    Queue::assertNotPushed(GenerateLandingPageBatchJob::class);
    expect(LandingPageBatch::count())->toBe(0);

    $funnel = $this->summit->funnels()->where('slug', 'tf')->firstOrFail();
    $steps = $funnel->steps()->orderBy('sort_order')->get();

    expect($steps)->toHaveCount(2);
    expect($steps->pluck('step_type')->all())->toBe(['optin', 'sales_page']);

    $optin = $steps->firstWhere('step_type', 'optin');
    expect($optin->page_content['template_key'])->toBe('ochre-ink');
    // Optin's enabled_sections come from the registry default (full optin
    // body) when no per-step picker is in the form anymore.
    $registry = app(TemplateRegistry::class);
    $expectedOptin = array_values(array_diff(
        $registry->supportedSections('ochre-ink'),
        $registry->defaultSalesSections('ochre-ink'),
    ));
    expect($optin->page_content['enabled_sections'])->toEqualCanonicalizing($expectedOptin);

    // Content keys come from the whole-template jsonSchema (camelCase),
    // which is what Next's Zod validates. Every required top-level
    // property must be present even for sections not in enabled_sections,
    // otherwise validation fails and preview errors.
    expect(array_keys($optin->page_content['content']))->toContain(
        'masthead', 'hero', 'featuredIn', 'socialProof', 'whatIsThis',
        'speakersByDay', 'footer', 'closing',
    );
    expect($optin->page_content['content']['masthead'])->toHaveKeys(['volume', 'eyebrow']);
    expect($optin->page_content['content']['masthead']['volume'])->toBeString()->not->toBeEmpty();
    expect($optin->page_content['content']['footer'])->toHaveKeys(['tagline', 'volume', 'copyright']);
});

it('seeds sales_page steps with sales-section content, not optin content', function (string $templateKey) {
    // The whole-template jsonSchema's `required` list is the optin body. Without
    // step-type-aware scoping, a sales_page step would get optin placeholder
    // content (hero/masthead/faqs/...) while its `enabled_sections` points at
    // sales keys (sales-hero/price-card/...), so nothing renders and the page
    // goes blank. The CreateFunnel flow must rewrite `required` for sales_page
    // steps so placeholder content covers the sales camelCase keys.
    Queue::fake();

    // The new CreateFunnel flow no longer takes per-step section CheckboxLists
    // — it scaffolds steps from the registry's defaults for the chosen skin.
    // Default sales sections come straight from the template manifest.
    $registry = app(TemplateRegistry::class);
    $expectedSales = $registry->defaultSalesSections($templateKey);
    $salesCamel = array_map(
        static fn (string $k): string => lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $k)))),
        $expectedSales,
    );
    $slug = 'sf-'.str_replace('-', '', $templateKey);

    livewire(CreateFunnel::class)
        ->fillForm([
            'summit_id' => $this->summit->id,
            'name' => "Sales {$templateKey}",
            'slug' => $slug,
            'template_key' => $templateKey,
            'wp_checkout_redirect_url' => 'https://wp.example.com/checkout',
            'wp_thankyou_redirect_url' => 'https://wp.example.com/thank-you',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $funnel = $this->summit->funnels()->where('slug', $slug)->firstOrFail();
    $sales = $funnel->steps()->where('step_type', 'sales_page')->firstOrFail();

    expect($sales->page_content['enabled_sections'])->toEqualCanonicalizing($expectedSales);

    // Seeded content must contain the sales camelCase keys the skin actually
    // reads — otherwise the sales page renders blank.
    $contentKeys = array_keys($sales->page_content['content']);
    expect($contentKeys)->toContain(...$salesCamel);

    // And each seeded section must be a populated object (not an empty stub),
    // so the rendered sales page has something to show.
    foreach ($salesCamel as $key) {
        expect($sales->page_content['content'][$key])
            ->toBeArray()
            ->not->toBeEmpty();
    }
})->with([
    'ochre-ink' => ['ochre-ink'],
    'lime-ink' => ['lime-ink'],
    'cream-sage' => ['cream-sage'],
    'violet-sun' => ['violet-sun'],
    'rust-cream' => ['rust-cream'],
    'blue-coral' => ['blue-coral'],
    'green-gold' => ['green-gold'],
    'indigo-gold' => ['indigo-gold'],
]);

it('creates no steps when no skin is picked', function () {
    // Section CheckboxLists are hidden until a skin is chosen, so a
    // skin-less funnel ends up with an empty section_config and no
    // auto-generated steps — the operator adds steps later by hand.
    Queue::fake();

    livewire(CreateFunnel::class)
        ->fillForm([
            'summit_id' => $this->summit->id,
            'name' => 'No Skin Funnel',
            'slug' => 'ns',
            'wp_checkout_redirect_url' => 'https://wp.example.com/checkout',
            'wp_thankyou_redirect_url' => 'https://wp.example.com/thank-you',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $funnel = $this->summit->funnels()->where('slug', 'ns')->firstOrFail();

    expect($funnel->template_key)->toBeNull();
    expect($funnel->steps()->count())->toBe(0);
    Queue::assertNotPushed(GenerateLandingPageBatchJob::class);
});
