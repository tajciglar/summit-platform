<?php

namespace App\Filament\Resources\FunnelStepBumps;

use App\Filament\Resources\FunnelStepBumps\Pages;
use App\Models\FunnelStepBump;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

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
                    SpatieMediaLibraryFileUpload::make('image')
                        ->collection('image')
                        ->image()
                        ->imageEditor()
                        ->imageCropAspectRatio('1:1')
                        ->maxSize(5120)
                        ->label('Bump image')
                        ->helperText('Square image works best; shown next to the copy on checkout.')
                        ->live(),
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
     * Bump has no summit_id — scope through funnel_step.funnel.summit_id.
     */
    public static function scopeEloquentQueryToTenant(
        \Illuminate\Database\Eloquent\Builder $query,
        ?\Illuminate\Database\Eloquent\Model $tenant,
    ): \Illuminate\Database\Eloquent\Builder {
        $tenant ??= \Filament\Facades\Filament::getTenant();

        if (! $tenant) {
            return $query;
        }

        return $query->whereHas(
            'funnelStep.funnel',
            fn ($q) => $q->whereKey($tenant->getKey()),
        );
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'funnelStep';
    }

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
        ?\Illuminate\Database\Eloquent\Model $tenant = null,
        bool $shouldGuessMissingParameters = false,
    ): string {
        return \App\Filament\Resources\FunnelSteps\FunnelStepResource::getUrl(
            'index', $parameters, $isAbsolute, $panel, $tenant, $shouldGuessMissingParameters,
        );
    }
}
