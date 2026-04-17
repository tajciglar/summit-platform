<?php

namespace App\Filament\Resources\Funnels;

use App\Filament\Resources\Concerns\ScopesTenantViaSummitDomains;
use App\Models\Funnel;
use App\Models\Summit;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
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
                                    $query->whereHas(
                                        'domains',
                                        fn ($q) => $q->whereKey($domain->getKey()),
                                    );
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
                    Toggle::make('is_active')->default(true),
                ]),
        ]);
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
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('name');
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFunnels::route('/'),
            'create' => Pages\CreateFunnel::route('/create'),
            'view' => Pages\ViewFunnel::route('/{record}'),
            'edit' => Pages\EditFunnel::route('/{record}/edit'),
            'generate-landing-pages' => Pages\GenerateLandingPagesPage::route('/{record}/generate-landing-pages'),
            'landing-pages' => Pages\LandingPageDraftsPage::route('/{record}/landing-pages'),
            'edit-landing-page-draft' => Pages\EditLandingPageDraftPage::route('/{record}/landing-pages/{draft}/edit'),
        ];
    }
}
