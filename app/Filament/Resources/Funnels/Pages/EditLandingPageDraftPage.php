<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\LandingPageDraft;
use App\Services\Templates\FilamentSchemaMapper;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Filament\Schemas\Components\Fieldset;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

/**
 * Render per-section fieldsets with an on/off toggle for each supported
 * section. Legacy templates without `supportedSections` fall back to a single
 * whole-schema form rendered under `data.content`.
 */
class EditLandingPageDraftPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = FunnelResource::class;

    protected string $view = 'filament.pages.edit-landing-page-draft';

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

        $initial = [
            'content' => $this->landingDraft->sections ?? [],
            'enabled' => [],
        ];

        if ($registry->exists($this->landingDraft->template_key) && $registry->supportsSections($this->landingDraft->template_key)) {
            $supported = $registry->supportedSections($this->landingDraft->template_key);
            $enabled = $this->landingDraft->enabled_sections
                ?? $registry->defaultEnabledSections($this->landingDraft->template_key);

            foreach ($supported as $key) {
                $initial['enabled'][$key] = in_array($key, $enabled, true);
            }
        }

        $this->form->fill($initial);
    }

    public function form(Schema $schema): Schema
    {
        $registry = app(TemplateRegistry::class);
        $mapper = app(FilamentSchemaMapper::class);
        $templateKey = $this->landingDraft->template_key;
        $summitId = $this->funnel->summit_id;

        // Legacy templates without per-section support: one big form under data.content.
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

        // Per-section mode.
        $supported = $registry->supportedSections($templateKey);
        $schemas = $registry->sectionSchemas($templateKey);
        $order = $registry->sectionOrder($templateKey);
        $orderedKeys = array_values(array_filter($order, fn (string $k): bool => in_array($k, $supported, true)));

        $sections = [];
        foreach ($orderedKeys as $key) {
            $label = $this->humanizeSectionLabel($key);
            $sectionSchema = $schemas[$key] ?? [];
            $fields = $mapper->map($sectionSchema, $summitId);

            $sections[] = Section::make($label)
                ->description("Toggle to include or hide {$label} on the published page.")
                ->collapsible()
                ->schema([
                    Toggle::make("enabled.{$key}")
                        ->label('Include on page')
                        ->inline(false),
                    Fieldset::make($label)
                        ->label($label)
                        ->statePath("content.{$key}")
                        ->schema($fields),
                ]);
        }

        return $schema
            ->components($sections)
            ->statePath('data');
    }

    public function save(): void
    {
        $state = $this->form->getState();
        $content = $state['content'] ?? [];
        $enabledMap = $state['enabled'] ?? [];

        $registry = app(TemplateRegistry::class);

        if ($registry->exists($this->landingDraft->template_key) && $registry->supportsSections($this->landingDraft->template_key)) {
            $order = $registry->sectionOrder($this->landingDraft->template_key);
            $enabled = array_values(array_filter(
                $order,
                fn (string $k): bool => ! empty($enabledMap[$k]),
            ));

            $this->landingDraft->update([
                'sections' => $content,
                'enabled_sections' => $enabled,
            ]);
        } else {
            $this->landingDraft->update([
                'sections' => $content,
            ]);
        }

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
