<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\LandingPageDraft;
use App\Services\Templates\FilamentSchemaMapper;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/**
 * Block-based draft editor. Each enabled section becomes a draggable block
 * the operator can reorder, edit in-place, remove, or add from the "add
 * block" menu (which lists the skin's supported sections that aren't already
 * on the page).
 *
 * Draft storage stays associative: `sections` is a map keyed by section
 * key, `enabled_sections` is the ordered list that drives rendering. On
 * save we rebuild both from the Builder's sequential state.
 */
class EditLandingPageDraftPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = FunnelResource::class;

    protected string $view = 'filament.pages.edit-landing-page-draft';

    protected static string $layout = 'filament.layouts.focused';

    protected static ?string $title = 'Edit Landing Page';

    public Funnel $funnel;

    public LandingPageDraft $landingDraft;

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(string $record, string $draft): void
    {
        $this->funnel = Funnel::findOrFail($record);
        $this->landingDraft = LandingPageDraft::findOrFail($draft);

        $registry = app(TemplateRegistry::class);
        $templateKey = $this->landingDraft->template_key;

        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            // Legacy whole-schema form: bind content directly.
            $this->form->fill([
                'content' => $this->landingDraft->sections ?? [],
            ]);

            return;
        }

        $supported = $registry->supportedSections($templateKey);
        $sections = $this->landingDraft->sections ?? [];
        $enabled = $this->landingDraft->enabled_sections
            ?? $registry->defaultEnabledSections($templateKey);

        $enabled = array_values(array_filter(
            $enabled,
            fn (string $key): bool => in_array($key, $supported, true),
        ));

        $blocks = array_map(
            fn (string $key): array => [
                'type' => $key,
                'data' => $sections[$key] ?? [],
            ],
            $enabled,
        );

        $this->form->fill([
            'blocks' => $blocks,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        $registry = app(TemplateRegistry::class);
        $mapper = app(FilamentSchemaMapper::class);
        $templateKey = $this->landingDraft->template_key;
        $summitId = $this->funnel->summit_id;

        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            $template = $registry->exists($templateKey) ? $registry->get($templateKey) : ['jsonSchema' => []];
            $components = $mapper->map($template['jsonSchema'] ?? [], $summitId);

            return $schema
                ->components([
                    Section::make('Content')
                        ->statePath('content')
                        ->schema($components),
                ])
                ->statePath('data');
        }

        $supported = $registry->supportedSections($templateKey);
        $sectionSchemas = $registry->sectionSchemas($templateKey);

        $blocks = array_map(
            function (string $key) use ($sectionSchemas, $mapper, $summitId): Block {
                $label = $this->humanizeSectionLabel($key);

                return Block::make($key)
                    ->label($label)
                    ->schema($mapper->map($sectionSchemas[$key] ?? [], $summitId));
            },
            $supported,
        );

        return $schema
            ->components([
                Builder::make('blocks')
                    ->label('Page blocks')
                    ->blocks($blocks)
                    ->addActionLabel('Add section')
                    ->collapsible()
                    ->collapsed()
                    ->cloneable()
                    ->reorderable()
                    ->blockNumbers(false),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $state = $this->form->getState();
        $registry = app(TemplateRegistry::class);
        $templateKey = $this->landingDraft->template_key;

        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            $this->landingDraft->update([
                'sections' => $state['content'] ?? [],
            ]);

            Notification::make()
                ->title('Draft saved')
                ->success()
                ->send();

            return;
        }

        $blocks = array_values(array_filter(
            $state['blocks'] ?? [],
            fn ($b): bool => is_array($b) && isset($b['type']),
        ));

        $sections = [];
        $enabled = [];
        foreach ($blocks as $block) {
            $key = (string) $block['type'];
            $sections[$key] = $block['data'] ?? [];
            $enabled[] = $key;
        }

        $this->landingDraft->update([
            'sections' => $sections,
            'enabled_sections' => $enabled,
        ]);

        Notification::make()
            ->title('Draft saved')
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')
                ->label('Save draft')
                ->action('save'),
        ];
    }

    private function humanizeSectionLabel(string $key): string
    {
        return ucwords(str_replace(['-', '_'], ' ', $key));
    }
}
