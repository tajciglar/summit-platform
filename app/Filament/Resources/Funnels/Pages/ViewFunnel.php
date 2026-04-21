<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\ViewEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Enums\FontWeight;

/**
 * Read-oriented funnel page with just slug + description editable inline.
 * Extends EditRecord so form state hydrates from the record, but the submit
 * action is hidden and each editable field saves independently on blur.
 */
class ViewFunnel extends EditRecord
{
    protected static string $resource = FunnelResource::class;

    /** Step types the one-click generator will produce pages for. */
    private const GENERABLE_STEP_TYPES = ['optin', 'sales_page', 'thank_you'];

    protected function getHeaderActions(): array
    {
        return [
            Action::make('generate_all_steps')
                ->label('Generate all steps')
                ->icon('heroicon-o-sparkles')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Generate landing pages for every step?')
                ->modalDescription('One batch per step, all sharing the funnel skin and palette. Section mix per step comes from the funnel design settings.')
                ->modalSubmitActionLabel('Generate')
                ->visible(fn (Funnel $record): bool => (bool) $record->template_key)
                ->action(function (Funnel $record): void {
                    $steps = $record->steps()
                        ->whereIn('step_type', self::GENERABLE_STEP_TYPES)
                        ->get();

                    if ($steps->isEmpty()) {
                        Notification::make()
                            ->title('No generable steps')
                            ->body('Add an optin / sales / thank-you step first, then try again.')
                            ->warning()
                            ->send();

                        return;
                    }

                    $dispatched = 0;
                    foreach ($steps as $step) {
                        $batch = LandingPageBatch::create([
                            'summit_id' => $record->summit_id,
                            'funnel_id' => $record->id,
                            'funnel_step_id' => $step->id,
                            'status' => 'queued',
                            'template_pool' => [$record->template_key],
                            'versions_per_template' => [$record->template_key => 1],
                            'version_count' => 1,
                            'auto_publish' => true,
                            'published_by_user_id' => auth()->id(),
                        ]);
                        GenerateLandingPageBatchJob::dispatch($batch->id);
                        $dispatched++;
                    }

                    Notification::make()
                        ->title('Generating '.$dispatched.' step'.($dispatched === 1 ? '' : 's'))
                        ->body('All steps share the funnel skin and palette. Previews appear under each step when ready.')
                        ->success()
                        ->send();
                }),

            Action::make('new_step')
                ->label('New step')
                ->icon('heroicon-o-plus')
                ->color('gray')
                ->url(fn () => FunnelStepResource::getUrl('create')),
            DeleteAction::make(),
        ];
    }

    /** Hide the default submit button; slug + description save on blur. */
    protected function getFormActions(): array
    {
        return [];
    }

    /**
     * ViewFunnel extends EditRecord so Filament's default breadcrumb tail
     * reads "Edit", which is misleading — this page is the funnel overview.
     * Collapse the trail to just `Funnels > {name}` so operators can tell
     * they've landed on the view page rather than the edit form.
     *
     * @return array<string, string>
     */
    public function getBreadcrumbs(): array
    {
        /** @var Funnel $funnel */
        $funnel = $this->record;

        return [
            FunnelResource::getUrl('index') => FunnelResource::getBreadcrumb(),
            $funnel->name,
        ];
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()
                ->columnSpanFull()
                ->columns(12)
                ->schema([
                    TextEntry::make('name')
                        ->hiddenLabel()
                        ->size('lg')
                        ->weight(FontWeight::Bold)
                        ->columnSpan(6),
                    TextEntry::make('is_active')
                        ->label('Status')
                        ->badge()
                        ->formatStateUsing(fn (bool $state) => $state ? 'Live' : 'Paused')
                        ->color(fn (bool $state) => $state ? 'success' : 'gray')
                        ->icon(fn (bool $state) => $state ? 'heroicon-m-bolt' : 'heroicon-m-pause-circle')
                        ->columnSpan(2),
                    TextEntry::make('target_phase')
                        ->label('Phase')
                        ->badge()
                        ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : 'all phases')
                        ->color(fn (?string $state): string => match ($state) {
                            'during' => 'success',
                            'late_pre' => 'warning',
                            'pre' => 'info',
                            'post' => 'gray',
                            default => 'primary',
                        })
                        ->columnSpan(2),
                    TextEntry::make('summit.title')
                        ->label('Summit')
                        ->columnSpan(2),

                    TextInput::make('slug')
                        ->label('Slug')
                        ->prefix('/')
                        ->required()
                        ->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['slug' => $state]);
                            Notification::make()->title('Slug saved')->success()->send();
                        })
                        ->columnSpan(6),

                    Textarea::make('description')
                        ->label('Description')
                        ->placeholder('No description')
                        ->rows(3)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['description' => $state]);
                            Notification::make()->title('Description saved')->success()->send();
                        })
                        ->columnSpan(6),

                    Select::make('template_key')
                        ->label('Skin')
                        ->options(fn () => self::skinOptions())
                        ->placeholder('None — pick a skin to enable one-click generation')
                        ->helperText('The visual language (typography, spacing, layout). All steps share this skin.')
                        ->native(false)
                        ->searchable()
                        ->live()
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['template_key' => $state]);
                            Notification::make()->title('Skin saved')->success()->send();
                        })
                        ->columnSpan(6),
                ]),

            Section::make('Sections per step type')
                ->description('Selected sections will be generated on each step type when you click "Generate all steps".')
                ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key')))
                ->columns(3)
                ->schema([
                    CheckboxList::make('section_config.optin')
                        ->label('Optin')
                        ->options(fn (Get $get) => self::sectionOptionsFor($get('template_key')))
                        ->columns(1)
                        ->bulkToggleable()
                        ->live()
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update([
                                'section_config' => array_merge(
                                    $record->section_config ?? [],
                                    ['optin' => array_values($state ?? [])],
                                ),
                            ]);
                            Notification::make()->title('Optin sections saved')->success()->send();
                        }),

                    CheckboxList::make('section_config.sales_page')
                        ->label('Sales page')
                        ->options(fn (Get $get) => self::sectionOptionsFor($get('template_key')))
                        ->columns(1)
                        ->bulkToggleable()
                        ->live()
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update([
                                'section_config' => array_merge(
                                    $record->section_config ?? [],
                                    ['sales_page' => array_values($state ?? [])],
                                ),
                            ]);
                            Notification::make()->title('Sales page sections saved')->success()->send();
                        }),

                    CheckboxList::make('section_config.thank_you')
                        ->label('Thank you')
                        ->options(fn (Get $get) => self::sectionOptionsFor($get('template_key')))
                        ->columns(1)
                        ->bulkToggleable()
                        ->live()
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update([
                                'section_config' => array_merge(
                                    $record->section_config ?? [],
                                    ['thank_you' => array_values($state ?? [])],
                                ),
                            ]);
                            Notification::make()->title('Thank-you sections saved')->success()->send();
                        }),
                ]),

            ViewEntry::make('steps_list')
                ->columnSpanFull()
                ->view('filament.funnels.steps-list'),
        ]);
    }

    /** @return array<string, string> */
    private static function skinOptions(): array
    {
        $registry = app(TemplateRegistry::class);

        return collect($registry->allKeys())
            ->mapWithKeys(fn (string $key) => [$key => $registry->get($key)['label'] ?? $key])
            ->all();
    }

    /** @return array<string, string> */
    private static function sectionOptionsFor(?string $templateKey): array
    {
        if (! $templateKey) {
            return [];
        }

        $registry = app(TemplateRegistry::class);
        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            return [];
        }

        return collect($registry->supportedSections($templateKey))
            ->mapWithKeys(fn (string $key) => [
                $key => ucwords(str_replace(['-', '_'], ' ', $key)),
            ])
            ->all();
    }

    private static function skinSupportsSections(?string $templateKey): bool
    {
        if (! $templateKey) {
            return false;
        }

        $registry = app(TemplateRegistry::class);

        return $registry->exists($templateKey) && $registry->supportsSections($templateKey);
    }
}
