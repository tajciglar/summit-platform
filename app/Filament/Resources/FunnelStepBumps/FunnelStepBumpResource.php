<?php

namespace App\Filament\Resources\FunnelStepBumps;

use App\Filament\Forms\Components\MediaPickerInput;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStepBump;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Panel;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class FunnelStepBumpResource extends Resource
{
    protected static ?string $model = FunnelStepBump::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPlusCircle;

    /** Hidden from the sidebar — bumps are always accessed via a funnel step's checkout card. */
    protected static bool $shouldRegisterNavigation = false;

    public static function form(Schema $schema): Schema
    {
        // Used by create + edit. Each field is ->live() so the right-pane
        // preview (rendered by the page Blade view) reacts on every keystroke.
        return $schema->components([
            Section::make('Content')
                ->components([
                    TextInput::make('headline')
                        ->label('Call to action')
                        ->placeholder('Yes — add this for $17')
                        ->maxLength(500)
                        ->live(debounce: 300),

                    Textarea::make('description')
                        ->rows(3)
                        ->maxLength(2000)
                        ->live(debounce: 300),

                    Repeater::make('bullets')
                        ->label('Bullet list (optional)')
                        ->schema([
                            TextInput::make('text')
                                ->hiddenLabel()
                                ->placeholder('Feature or benefit')
                                ->live(debounce: 300),
                        ])
                        ->collapsible()
                        ->addActionLabel('Add bullet')
                        ->defaultItems(0)
                        ->live(),

                    TextInput::make('checkbox_label')
                        ->label('Checkbox label')
                        ->placeholder('Yes, add this to my order')
                        ->maxLength(255)
                        ->live(debounce: 300),
                ]),

            Section::make('Image')
                ->components([
                    MediaPickerInput::make('image_media_item_id')
                        ->category('product')
                        ->subCategory('bump')
                        ->role('image')
                        ->label('Bump image')
                        ->captionUsing(fn (FunnelStepBump $record): string => ($record->headline ?: 'Order bump').' — image')
                        ->altTextUsing(fn (FunnelStepBump $record): string => (string) ($record->headline ?: 'Order bump image')),
                ]),

            Section::make('Settings')
                ->columns(2)
                ->components([
                    Select::make('funnel_step_id')
                        ->label('Attached to checkout step')
                        ->relationship(
                            'funnelStep',
                            'name',
                            fn ($query) => $query->where('step_type', 'checkout'),
                        )
                        ->searchable()
                        ->preload()
                        ->required(),
                    Select::make('product_id')
                        ->label('Product being offered')
                        ->relationship(
                            'product',
                            'name',
                            fn ($query) => $query->where('kind', '!=', 'combo'),
                        )
                        ->searchable()
                        ->preload()
                        ->required(),
                    TextInput::make('sort_order')
                        ->numeric()
                        ->default(0),
                    Toggle::make('is_active')
                        ->default(true),
                ]),
        ]);
    }

    /**
     * Bump → FunnelStep → Funnel → Summit → Domains. Tenant is Domain.
     * When a summit is selected, narrow further to that summit's funnels.
     */
    public static function scopeEloquentQueryToTenant(
        Builder $query,
        ?Model $tenant,
    ): Builder {
        $tenant ??= Filament::getTenant();

        if (! $tenant) {
            return $query;
        }

        $query->whereHas(
            'funnelStep.funnel.summit',
            fn ($q) => $q->where('domain_id', $tenant->getKey()),
        );

        if ($summitId = CurrentSummit::getId()) {
            $query->whereHas(
                'funnelStep.funnel',
                fn ($q) => $q->where('summit_id', $summitId),
            );
        }

        return $query;
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'funnelStep';
    }

    /**
     * Default Filament behavior fires `funnelStep()->associate($tenant)` on
     * create. Our tenant is a Domain (not a FunnelStep), so that would trip
     * the FK. Read scoping is handled above; the form's `funnel_step_id`
     * field supplies the correct value on create.
     */
    public static function observeTenancyModelCreation(Panel $panel): void {}

    public static function getPages(): array
    {
        return [
            'create' => Pages\CreateFunnelStepBump::route('/create'),
            'edit' => Pages\EditFunnelStepBump::route('/{record}/edit'),
        ];
    }

    /**
     * No index page — bumps are always viewed in the funnel step context.
     * Return to the funnel steps list instead of erroring.
     */
    public static function getIndexUrl(
        array $parameters = [],
        bool $isAbsolute = true,
        ?string $panel = null,
        ?Model $tenant = null,
        bool $shouldGuessMissingParameters = false,
    ): string {
        return FunnelStepResource::getUrl(
            'index', $parameters, $isAbsolute, $panel, $tenant, $shouldGuessMissingParameters,
        );
    }
}
