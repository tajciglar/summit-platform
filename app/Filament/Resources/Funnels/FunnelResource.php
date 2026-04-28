<?php

namespace App\Filament\Resources\Funnels;

use App\Actions\DuplicateFunnel;
use App\Filament\Resources\Concerns\ScopesTenantViaSummitDomains;
use App\Models\Funnel;
use App\Models\Summit;
use App\Services\Templates\TemplateRegistry;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Enums\IconPosition;
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

    /**
     * Hidden from sidebar — funnels are always reached via a Summit,
     * so a cross-summit funnel list is not meaningful.
     */
    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        // Edit form keeps only fields that operators actually update post-creation:
        // identity (name/slug), wiring (summit, WP redirects), AC tag, notes.
        // Removed per spec: live (is_active), phase (target_phase), summit
        // category, skin (template_key), description.
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
                    TextInput::make('ac_optin_tag')
                        ->label('ActiveCampaign optin tag')
                        ->placeholder('e.g. ATS1 APR26 SIGNUP')
                        ->maxLength(255)
                        ->helperText('Tag applied to contacts who opt in via this funnel. Leave blank to skip AC sync.'),
                    TextInput::make('wp_checkout_redirect_url')
                        ->label('WordPress checkout URL')
                        ->url()
                        ->required()
                        ->maxLength(2048)
                        ->helperText('Interim checkout redirect to the legacy WP cart.')
                        ->columnSpanFull(),
                    TextInput::make('wp_thankyou_redirect_url')
                        ->label('WordPress thank-you page URL')
                        ->url()
                        ->required()
                        ->maxLength(2048)
                        ->helperText('Interim thank-you redirect for visitors who decline the sales offer.')
                        ->columnSpanFull(),
                    Textarea::make('notes')
                        ->label('Internal notes')
                        ->rows(4)
                        ->maxLength(10000)
                        ->placeholder('Operator-only notes about this funnel.')
                        ->columnSpanFull(),
                ]),

            // Skin + section choices live behind the create flow only — the
            // edit form is intentionally slim per spec. Operators reach skin
            // changes via the per-funnel ViewFunnel page.
            Section::make('Design')
                ->description('Pick a skin and the sections each step type renders. Steps are auto-seeded from this on create.')
                ->visibleOn('create')
                ->components([
                    Select::make('template_key')
                        ->label('Skin')
                        ->options(fn () => self::skinOptions())
                        ->native(false)
                        ->searchable()
                        ->live()
                        ->afterStateUpdated(function (?string $state, Set $set, Get $get): void {
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
                        ->columns(1)
                        ->bulkToggleable()
                        ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key'))),

                    CheckboxList::make('section_config.sales_page')
                        ->label('Sales page sections')
                        ->options(fn (Get $get) => self::salesSectionOptionsFor($get('template_key')))
                        ->columns(1)
                        ->bulkToggleable()
                        ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key'))),

                    CheckboxList::make('section_config.thank_you')
                        ->label('Thank-you sections')
                        ->options(fn (Get $get) => self::sectionOptionsFor($get('template_key')))
                        ->columns(1)
                        ->bulkToggleable()
                        ->visible(fn (Get $get): bool => self::skinSupportsSections($get('template_key'))),
                ]),
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
            ->values()
            ->mapWithKeys(fn (string $key, int $i) => [
                $key => str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT).'.  '.ucwords(str_replace(['-', '_'], ' ', $key)),
            ])
            ->all();
    }

    /**
     * Returns a descriptions array for the CheckboxList where each value is a
     * short "Position 3 of 7 · sales-page" style hint. Keys line up with the
     * CheckboxList options so Filament renders them directly beneath each row.
     *
     * @param  array<string, string>  $options
     * @return array<string, string>
     */
    private static function sectionPositionDescriptions(?string $templateKey, array $options): array
    {
        if (! $templateKey || $options === []) {
            return [];
        }

        $total = count($options);
        $i = 0;
        $out = [];
        foreach (array_keys($options) as $key) {
            $i++;
            $out[$key] = "Position {$i} of {$total}";
        }

        return $out;
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
            ->values()
            ->mapWithKeys(fn (string $key, int $i) => [
                $key => str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT).'.  '.ucwords(str_replace(['-', '_'], ' ', $key)),
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
            ->values()
            ->mapWithKeys(fn (string $key, int $i) => [
                $key => str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT).'.  '.ucwords(str_replace(['-', '_'], ' ', $key)),
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
                // Live URL = hostname from the funnel's summit's domain +
                // funnel slug. Renders as a clickable link when the funnel
                // is_active + has an active domain; greyed out otherwise.
                TextColumn::make('live_url')
                    ->label('Live URL')
                    ->state(function (Funnel $record): ?string {
                        $host = optional($record->summit?->domain)->hostname;
                        if (! $host) {
                            return null;
                        }

                        return 'https://'.$host.'/'.$record->slug;
                    })
                    ->url(fn (Funnel $record): ?string => $record->is_active
                        ? (($h = optional($record->summit?->domain)->hostname) ? 'https://'.$h.'/'.$record->slug : null)
                        : null)
                    ->openUrlInNewTab()
                    ->color(fn (Funnel $record): string => $record->is_active ? 'primary' : 'gray')
                    ->icon(fn (Funnel $record): ?string => $record->is_active ? 'heroicon-m-arrow-top-right-on-square' : null)
                    ->iconPosition(IconPosition::After)
                    ->placeholder('— no domain —')
                    ->copyable()
                    ->toggleable(),
                TextColumn::make('target_phase')
                    ->label('Phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : 'all')
                    ->color(fn (?string $state): string => match ($state) {
                        'summit_starts' => 'info',
                        'summit_live' => 'success',
                        'open_all_pages' => 'warning',
                        'summit_end' => 'gray',
                        default => 'primary',
                    })
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('ac_optin_tag')
                    ->label('AC tag')
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('steps_count')
                    ->counts('steps')
                    ->label('Steps')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('notes')
                    ->label('Notes')
                    ->state(fn (Funnel $record): string => $record->notes ? Str::limit($record->notes, 60) : '+ Add notes')
                    ->color(fn (Funnel $record): string => $record->notes ? 'primary' : 'gray')
                    ->action(
                        Action::make('viewNotes')
                            ->modalHeading('Funnel notes')
                            ->modalDescription(fn (Funnel $record): string => $record->name)
                            ->modalIcon('heroicon-o-document-text')
                            ->modalCancelActionLabel('Close')
                            ->modalSubmitActionLabel('Save notes')
                            ->schema([
                                Textarea::make('notes')
                                    ->label('Internal notes')
                                    ->rows(8)
                                    ->maxLength(10000),
                            ])
                            ->fillForm(fn (Funnel $record): array => ['notes' => $record->notes])
                            ->action(function (array $data, Funnel $record): void {
                                $record->update(['notes' => $data['notes'] ?? null]);
                                Notification::make()->title('Notes saved')->success()->send();
                            })
                    )
                    ->toggleable(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->filters([
                SelectFilter::make('summit_id')
                    ->relationship('summit', 'title')
                    ->label('Summit')
                    ->preload(),
                SelectFilter::make('target_phase')->options([
                    'summit_starts' => 'Summit starts',
                    'summit_live' => 'Summit live',
                    'open_all_pages' => 'All pages open',
                    'summit_end' => 'Summit ended',
                ]),
                TernaryFilter::make('is_active'),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('open_live')
                    ->label('Open live')
                    ->icon('heroicon-m-arrow-top-right-on-square')
                    ->color('success')
                    ->url(fn (Funnel $record): ?string => $record->is_active && ($h = optional($record->summit?->domain)->hostname)
                        ? 'https://'.$h.'/'.$record->slug
                        : null)
                    ->openUrlInNewTab()
                    ->visible(fn (Funnel $record): bool => $record->is_active && optional($record->summit?->domain)->hostname !== null),
                Action::make('duplicate')
                    ->label('Duplicate')
                    ->icon(Heroicon::OutlinedDocumentDuplicate)
                    ->color('gray')
                    ->modalHeading('Duplicate this funnel')
                    ->modalDescription('Copies the funnel with all steps, block content, and bumps. Pick a destination summit and skin to apply.')
                    ->modalSubmitActionLabel('Duplicate')
                    ->schema(fn (Funnel $record): array => [
                        Select::make('template_key')
                            ->label('Skin')
                            ->options(fn () => self::skinOptions())
                            ->default($record->template_key)
                            ->placeholder('Keep current skin')
                            ->native(false)
                            ->searchable(),
                        Select::make('destination_summit_id')
                            ->label('Destination summit')
                            ->options(function () {
                                $query = Summit::query();
                                $domain = Filament::getTenant();
                                if ($domain) {
                                    $query->where('domain_id', $domain->getKey());
                                }

                                return $query->orderBy('title')->pluck('title', 'id')->all();
                            })
                            ->default(fn () => $record->summit_id)
                            ->required()
                            ->searchable(),
                    ])
                    ->action(function (array $data, Funnel $record): void {
                        $clone = app(DuplicateFunnel::class)->handle(
                            $record,
                            destinationSummitId: (string) $data['destination_summit_id'],
                            templateKey: $data['template_key'] ?? null,
                        );

                        Notification::make()
                            ->title('Funnel duplicated')
                            ->body('Created '.$clone->name.'.')
                            ->success()
                            ->send();
                    }),
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
