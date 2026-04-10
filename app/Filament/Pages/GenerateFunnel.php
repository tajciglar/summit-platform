<?php

namespace App\Filament\Pages;

use App\Models\Summit;
use App\Services\FunnelForgeMapper;
use App\Services\FunnelForgeService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class GenerateFunnel extends Page
{
    protected static \UnitEnum|string|null $navigationGroup = 'Funnels';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static ?string $navigationLabel = 'Generate Funnel';

    protected static ?string $title = 'Generate Funnel with AI';

    protected string $view = 'filament.pages.generate-funnel';

    protected function getHeaderActions(): array
    {
        return [
            Action::make('generate')
                ->label('Generate Funnel')
                ->icon('heroicon-o-sparkles')
                ->color('primary')
                ->size('lg')
                ->form([
                    Select::make('summit_id')
                        ->label('Summit')
                        ->options(
                            Summit::orderByDesc('created_at')
                                ->pluck('title', 'id')
                        )
                        ->searchable()
                        ->required()
                        ->helperText('The summit this funnel will be attached to.'),

                    TextInput::make('event_name')
                        ->label('Event Name')
                        ->required()
                        ->maxLength(255)
                        ->placeholder('e.g. The AI Marketing Summit 2026')
                        ->helperText('The name for the funnel being generated.'),

                    Select::make('event_type')
                        ->label('Event Type')
                        ->options([
                            'summit' => 'Summit',
                            'webinar' => 'Webinar',
                            'challenge' => 'Challenge',
                            'masterclass' => 'Masterclass',
                            'workshop' => 'Workshop',
                            'product-launch' => 'Product Launch',
                            'book-funnel' => 'Book Funnel',
                        ])
                        ->default('summit')
                        ->required(),

                    Textarea::make('target_audience')
                        ->label('Target Audience')
                        ->required()
                        ->rows(3)
                        ->placeholder('e.g. Online course creators who want to scale with virtual events')
                        ->helperText('Describe who this funnel is for. The more specific, the better the output.'),

                    TextInput::make('vip_price')
                        ->label('VIP Price ($)')
                        ->numeric()
                        ->placeholder('97')
                        ->helperText('Optional. Leave blank to let AI suggest a price.'),

                    Select::make('model')
                        ->label('AI Model')
                        ->options([
                            'haiku' => 'Haiku (fast, cheaper)',
                            'sonnet' => 'Sonnet (balanced)',
                            'opus' => 'Opus (highest quality)',
                        ])
                        ->default('sonnet'),
                ])
                ->action(function (array $data) {
                    $this->generateFunnel($data);
                }),
        ];
    }

    public function generateFunnel(array $data): void
    {
        $summit = Summit::findOrFail($data['summit_id']);

        $forge = new FunnelForgeService;

        if (! $forge->healthy()) {
            Notification::make()
                ->title('FunnelForge is not reachable')
                ->body('Make sure FunnelForge is running at '.config('services.funnelforge.url'))
                ->danger()
                ->send();

            return;
        }

        Notification::make()
            ->title('Generating funnel...')
            ->body('This may take up to 2 minutes. You will be notified when it is ready.')
            ->info()
            ->send();

        try {
            $params = [
                'eventName' => $data['event_name'],
                'eventType' => $data['event_type'],
                'targetAudience' => $data['target_audience'],
            ];

            if (! empty($data['vip_price'])) {
                $params['vipPrice'] = (int) $data['vip_price'];
            }

            if (! empty($data['model'])) {
                $params['model'] = $data['model'];
            }

            $record = $forge->generate($params);

            $mapper = new FunnelForgeMapper;
            $funnel = $mapper->map($record, $summit);

            Notification::make()
                ->title('Funnel generated!')
                ->body("Created \"{$funnel->name}\" with {$funnel->steps->count()} steps.")
                ->success()
                ->send();
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Notification::make()
                ->title('Generation failed')
                ->body('FunnelForge returned an error: '.$e->response->body())
                ->danger()
                ->send();
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Generation failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function getViewData(): array
    {
        $forge = new FunnelForgeService;

        return [
            'healthy' => $forge->healthy(),
            'funnelforgeUrl' => config('services.funnelforge.url'),
        ];
    }
}
