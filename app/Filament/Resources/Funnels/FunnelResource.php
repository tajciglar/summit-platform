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
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
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
                    Toggle::make('is_active')
                        ->label('Live')
                        ->helperText('Only one funnel per summit can be live. Marking this live will flip the current live funnel to draft.')
                        ->default(false),
                ]),

            Section::make('Design')
                ->description('One skin drives every step. Pick which steps to scaffold for this funnel.')
                ->components([
                    Select::make('template_key')
                        ->label('Skin')
                        ->options(fn () => self::skinOptions())
                        ->helperText('The visual language (typography, spacing, layout). All steps share this skin.')
                        ->native(false)
                        ->searchable(),

                    CheckboxList::make('steps_to_create')
                        ->label('Steps')
                        ->options([
                            'optin' => 'Optin',
                            'sales_page' => 'Sales page',
                            'thank_you' => 'Thank-you',
                        ])
                        ->default(['optin', 'sales_page', 'thank_you'])
                        ->dehydrated(false)
                        ->bulkToggleable()
                        ->visibleOn('create')
                        ->helperText('Each selected step is created with the skin\'s default sections. You can edit content later.'),
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
                        'during' => 'success',
                        'late_pre' => 'warning',
                        'pre' => 'info',
                        'post' => 'gray',
                        default => 'primary',
                    }),
                TextColumn::make('template_key')
                    ->label('Skin')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(fn (?string $state): string => $state
                        ? (self::skinOptions()[$state] ?? $state)
                        : '—')
                    ->toggleable(),
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
