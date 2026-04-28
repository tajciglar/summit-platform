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
        /** @var Funnel $funnel */
        $funnel = $this->record;
        $hostname = optional($funnel?->summit?->domain)->hostname;
        $isLive = (bool) $funnel?->is_active && $hostname;
        $liveUrl = $hostname ? 'https://'.$hostname.'/'.$funnel->slug : null;

        return [
            Action::make('open_live')
                ->label('Open live')
                ->icon('heroicon-m-arrow-top-right-on-square')
                ->color('success')
                ->url($liveUrl)
                ->openUrlInNewTab()
                ->visible($isLive),
            Action::make('publish')
                ->label('Publish')
                ->icon('heroicon-o-rocket-launch')
                ->color('primary')
                ->visible(fn (): bool => ! (bool) $funnel?->is_active)
                ->requiresConfirmation()
                ->modalHeading('Publish this funnel?')
                ->modalDescription('This will flip it live, deactivate any other live funnel on the same summit, and publish its steps.')
                ->action(function () use ($funnel): void {
                    try {
                        $funnel->update(['is_active' => true]);
                        Notification::make()->title('Funnel published')->success()->send();
                    } catch (\DomainException $e) {
                        Notification::make()->title('Cannot publish')->body($e->getMessage())->danger()->send();
                    }
                }),
            Action::make('unpublish')
                ->label('Unpublish')
                ->icon('heroicon-o-pause-circle')
                ->color('warning')
                ->visible(fn (): bool => (bool) $funnel?->is_active)
                ->requiresConfirmation()
                ->modalHeading('Unpublish this funnel?')
                ->modalDescription('The public URL will stop resolving.')
                ->action(function () use ($funnel): void {
                    $funnel->update(['is_active' => false]);
                    Notification::make()->title('Funnel unpublished')->success()->send();
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
                    TextInput::make('name')
                        ->hiddenLabel()
                        ->placeholder('Funnel name')
                        ->required()
                        ->maxLength(500)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['name' => $state]);
                            Notification::make()->title('Name saved')->success()->send();
                        })
                        ->columnSpan(8),
                    Select::make('target_phase')
                        ->label('Phase')
                        ->options([
                            'pre' => 'Pre-summit',
                            'late_pre' => 'Late pre-summit',
                            'during' => 'During summit',
                            'post' => 'Post-summit',
                        ])
                        ->placeholder('All phases')
                        ->native(false)
                        ->live()
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['target_phase' => $state]);
                            Notification::make()->title('Phase saved')->success()->send();
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
                        ->required()
                        ->maxLength(2048)
                        ->placeholder('https://...')
                        ->helperText('Sales-page CTAs redirect here.')
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['wp_checkout_redirect_url' => $state]);
                            Notification::make()->title('Checkout URL saved')->success()->send();
                        })
                        ->columnSpan(6),

                    TextInput::make('wp_thankyou_redirect_url')
                        ->label('WordPress thank-you page URL')
                        ->url()
                        ->required()
                        ->maxLength(2048)
                        ->placeholder('https://...')
                        ->helperText('"No thanks" link on sales page redirects here.')
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Funnel $record): void {
                            $record->update(['wp_thankyou_redirect_url' => $state]);
                            Notification::make()->title('Thank-you URL saved')->success()->send();
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
