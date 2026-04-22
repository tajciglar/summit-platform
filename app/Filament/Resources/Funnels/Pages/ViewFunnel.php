<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Filament\Resources\Summits\SummitResource;
use App\Models\Funnel;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\ViewEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Schemas\Components\Section;
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

    protected function getHeaderActions(): array
    {
        return [
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
     * Funnels live inside a summit. Breadcrumb climbs to the summit view
     * (which hosts the Funnels tab) instead of the standalone Funnels index,
     * so the back-nav matches how operators actually drilled in.
     *
     * @return array<string, string>
     */
    public function getBreadcrumbs(): array
    {
        /** @var Funnel $funnel */
        $funnel = $this->record;

        $breadcrumbs = [];
        if ($funnel->summit_id) {
            $breadcrumbs[SummitResource::getUrl('view', ['record' => $funnel->summit_id])] = $funnel->summit?->title ?? 'Summit';
        }
        $breadcrumbs[] = $funnel->name;

        return $breadcrumbs;
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

                    TextInput::make('wp_checkout_redirect_url')
                        ->label('WordPress checkout URL')
                        ->url()
                        ->maxLength(2048)
                        ->placeholder('https://...')
                        ->helperText('Sales-page CTAs redirect here. Leave blank once native checkout is live.')
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['wp_checkout_redirect_url' => $state]);
                            Notification::make()->title('Checkout URL saved')->success()->send();
                        })
                        ->columnSpan(6),
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
}
