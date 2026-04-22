<?php

namespace App\Filament\Resources\Funnels;

use App\Filament\Resources\Concerns\ScopesTenantViaSummitDomains;
use App\Models\Funnel;
use App\Models\Summit;
use App\Services\Templates\TemplateRegistry;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class FunnelResource extends Resource
{
    use ScopesTenantViaSummitDomains;

    protected static ?string $model = Funnel::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFunnel;

    protected static string|\UnitEnum|null $navigationGroup = 'Funnels';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Funnel')
                ->columns(2)
                ->components([
                    Select::make('summit_id')
                        ->label('Summit')
                        ->relationship(
                            'summit',
                            'title',
                            modifyQueryUsing: function ($query) {
                                $domain = Filament::getTenant();
                                if ($domain) {
                                    $query->where('domain_id', $domain->getKey());
                                }
                            },
                        )
                        ->default(fn () => CurrentSummit::getId())
                        ->hidden(fn (): bool => CurrentSummit::getId() !== null)
                        ->required()
                        ->searchable()
                        ->preload(),
                    Select::make('target_phase')
                        ->label('Active during')
                        ->options([
                            'pre' => 'Pre-summit',
                            'late_pre' => 'Late pre-summit',
                            'during' => 'During summit',
                            'post' => 'Post-summit',
                        ])
                        ->placeholder('All phases')
                        ->native(false),
                    TextInput::make('name')
                        ->required()->maxLength(500)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function (string $operation, $state, callable $set, callable $get): void {
                            if ($operation !== 'create') {
                                return;
                            }
                            $summitId = $get('summit_id') ?: CurrentSummit::getId();
                            $initials = $summitId
                                ? (Summit::withoutGlobalScopes()->find($summitId)?->initials ?? '')
                                : '';
                            $set('slug', self::composeFunnelSlug($initials, (string) $state));
                        }),
                    TextInput::make('slug')->required()->maxLength(255)
                        ->helperText('Auto-fills from summit initials + funnel purpose. Edit freely.'),
                    Textarea::make('description')->rows(3)->columnSpanFull(),
                    TextInput::make('wp_checkout_redirect_url')
                        ->label('WordPress checkout URL')
                        ->url()
                        ->maxLength(2048)
                        ->helperText('Interim checkout redirect to the legacy WP cart. Leave blank once native checkout is live.')
                        ->columnSpanFull(),
                    Toggle::make('is_active')
                        ->label('Live')
                        ->helperText('Only one funnel per summit can be live. Marking this live will flip the current live funnel to draft.')
                        ->default(false),
                ]),

            Section::make('Design')
                ->description('One skin drives every step. Palette is inherited from the summit audience. Pick which sections show up per step type; generate all steps in one click.')
                ->components([
                    Select::make('template_key')
                        ->label('Skin')
                        ->options(fn () => self::skinOptions())
                        ->helperText('The visual language (typography, spacing, layout). All steps share this skin.')
                        ->native(false)
                        ->searchable()
                        ->live()
                        ->afterStateUpdated(function (?string $state, Set $set, Get $get): void {
                            // Auto-seed section_config with the template's defaults
                            // so new funnels get distinct optin vs sales layouts
                            // without the operator having to pick every section.
                            if (! $state) {
                                return;
                            }
                            $current = $get('section_config') ?? [];
                            if (empty($current['optin'])) {
                                $set('section_config.optin', self::defaultOptinSectionsFor($state));
                            }
                            if (empty($current['sales_page'])) {
                                $set('section_config.sales_page', self::defaultSalesSectionsFor($state));
                            }
                        }),

                    CheckboxList::make('section_config.optin')
                        ->label('Optin sections')
                        ->options(fn (Get $get) => self::optinSectionOptionsFor($get('template_key')))
                        ->columns(2)
                        ->bulkToggleable()
                        ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key')))
                        ->helperText('Sections rendered on optin steps (lead capture).'),

                    CheckboxList::make('section_config.sales_page')
                        ->label('Sales page sections')
                        ->options(fn (Get $get) => self::salesSectionOptionsFor($get('template_key')))
                        ->columns(2)
                        ->bulkToggleable()
                        ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key')))
                        ->helperText('Sections rendered on sales-page steps (VIP / upgrade).'),

                    CheckboxList::make('section_config.thank_you')
                        ->label('Thank-you sections')
                        ->options(fn (Get $get) => self::sectionOptionsFor($get('template_key')))
                        ->columns(2)
                        ->bulkToggleable()
                        ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key')))
                        ->helperText('Sections rendered on thank-you steps.'),
                ])
                ->collapsed(fn (?Funnel $record): bool => $record !== null),
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

    /** @return array<string, string> */
    private static function optinSectionOptionsFor(?string $templateKey): array
    {
        if (! $templateKey) {
            return [];
        }

        $registry = app(TemplateRegistry::class);
        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            return [];
        }

        $sales = array_flip($registry->defaultSalesSections($templateKey));

        return collect($registry->supportedSections($templateKey))
            ->reject(fn (string $key) => isset($sales[$key]))
            ->mapWithKeys(fn (string $key) => [
                $key => ucwords(str_replace(['-', '_'], ' ', $key)),
            ])
            ->all();
    }

    /** @return array<string, string> */
    private static function salesSectionOptionsFor(?string $templateKey): array
    {
        if (! $templateKey) {
            return [];
        }

        $registry = app(TemplateRegistry::class);
        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            return [];
        }

        $sales = $registry->defaultSalesSections($templateKey);
        if ($sales === []) {
            return self::sectionOptionsFor($templateKey);
        }

        return collect($sales)
            ->mapWithKeys(fn (string $key) => [
                $key => ucwords(str_replace(['-', '_'], ' ', $key)),
            ])
            ->all();
    }

    /** @return list<string> */
    private static function defaultOptinSectionsFor(string $templateKey): array
    {
        $registry = app(TemplateRegistry::class);
        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            return [];
        }

        return $registry->defaultEnabledSections($templateKey);
    }

    /** @return list<string> */
    private static function defaultSalesSectionsFor(string $templateKey): array
    {
        $registry = app(TemplateRegistry::class);
        if (! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            return [];
        }

        return $registry->defaultSalesSections($templateKey);
    }

    private static function skinSupportsSections(?string $templateKey): bool
    {
        if (! $templateKey) {
            return false;
        }

        $registry = app(TemplateRegistry::class);

        return $registry->exists($templateKey) && $registry->supportsSections($templateKey);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('summit.title')->label('Summit')->searchable()->toggleable(),
                TextColumn::make('target_phase')
                    ->label('Phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : 'all')
                    ->color(fn (?string $state): string => match ($state) {
                        'during' => 'success',
                        'late_pre' => 'warning',
                        'pre' => 'info',
                        'post' => 'gray',
                        default => 'primary',
                    }),
                TextColumn::make('steps_count')
                    ->counts('steps')
                    ->label('Steps')
                    ->alignCenter()
                    ->toggleable(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->filters([
                SelectFilter::make('summit_id')
                    ->relationship('summit', 'title')
                    ->label('Summit')
                    ->preload(),
                SelectFilter::make('target_phase')->options([
                    'pre' => 'Pre-summit',
                    'late_pre' => 'Late pre-summit',
                    'during' => 'During summit',
                    'post' => 'Post-summit',
                ]),
                TernaryFilter::make('is_active'),
            ])
            ->recordActions([
                ViewAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('is_active', 'desc');
    }

    /**
     * Build a funnel slug like `aps` (opt-in) or `aps-checkout`.
     * Detects common funnel types from the name and prefixes with the
     * summit's initials so URLs stay short and predictable across a summit.
     */
    private static function composeFunnelSlug(string $initials, string $name): string
    {
        $lower = strtolower($name);
        $suffix = match (true) {
            str_contains($lower, 'opt-in') || str_contains($lower, 'optin') => '',
            str_contains($lower, 'checkout') => 'checkout',
            str_contains($lower, 'sales') => 'sales',
            str_contains($lower, 'upsell') => 'upsell',
            str_contains($lower, 'thank') => 'thanks',
            str_contains($lower, 'vip') => 'vip',
            default => Str::slug($name),
        };

        if ($initials === '') {
            return $suffix !== '' ? $suffix : Str::slug($name);
        }

        return $suffix !== '' ? "{$initials}-{$suffix}" : $initials;
    }

    public static function getRelations(): array
    {
        // Drafts list intentionally hidden for now; LandingPageDraftsRelationManager
        // stays available and can be restored once we bring the drafts UI back.
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFunnels::route('/'),
            'create' => Pages\CreateFunnel::route('/create'),
            'view' => Pages\ViewFunnel::route('/{record}'),
            'edit' => Pages\EditFunnel::route('/{record}/edit'),
            'edit-landing-page-draft' => Pages\EditLandingPageDraftPage::route('/{record}/landing-pages/{draft}/edit'),
        ];
    }
}
