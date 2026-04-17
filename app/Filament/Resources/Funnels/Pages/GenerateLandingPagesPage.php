<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Filament\Schemas\Schema;

class GenerateLandingPagesPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = FunnelResource::class;

    protected string $view = 'filament.pages.generate-landing-pages';

    protected static ?string $title = 'Generate Landing Pages';

    public Funnel $funnel;

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(string $record): void
    {
        $this->funnel = Funnel::findOrFail($record);

        $this->form->fill([
            'version_count' => 3,
            'template_pool' => [],
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('version_count')
                    ->label('Number of Variants')
                    ->numeric()
                    ->integer()
                    ->minValue(1)
                    ->maxValue(5)
                    ->required()
                    ->default(3),
                Select::make('template_pool')
                    ->label('Template Pool')
                    ->multiple()
                    ->options(function (TemplateRegistry $registry): array {
                        return collect($registry->allKeys())
                            ->mapWithKeys(fn (string $k) => [$k => $registry->get($k)['label'] ?? $k])
                            ->all();
                    })
                    ->helperText('Leave empty to use all templates.'),
                Textarea::make('notes')
                    ->label('Creative Notes')
                    ->rows(3)
                    ->placeholder('E.g. "Mention the free gifts, urgent tone, 5-day summit"'),
                TextInput::make('style_reference_url')
                    ->label('Style / Voice Reference URL')
                    ->url()
                    ->placeholder('https://parenting-summits.com'),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        \Illuminate\Support\Facades\Log::info('GenerateLandingPagesPage::submit called', ['funnel_id' => $this->funnel->id]);

        if (! $this->funnel->steps()->where('step_type', 'optin')->exists()) {
            Notification::make()
                ->title('Cannot generate landing pages')
                ->body('This funnel has no optin step. Add one before generating.')
                ->danger()
                ->send();

            return;
        }

        $data = $this->form->getState();

        $pool = $data['template_pool'] ?? [];

        $batch = LandingPageBatch::create([
            'summit_id' => $this->funnel->summit_id,
            'funnel_id' => $this->funnel->id,
            'version_count' => (int) $data['version_count'],
            'template_pool' => ! empty($pool) ? $pool : null,
            'notes' => $data['notes'] ?? null,
            'style_reference_url' => $data['style_reference_url'] ?? null,
            'status' => 'queued',
        ]);

        GenerateLandingPageBatchJob::dispatch($batch->id);

        $this->redirect(LandingPageDraftsPage::getUrl([
            'record' => $this->funnel->id,
            'batch' => $batch->id,
        ]));
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('submit')
                ->label('Start Generation')
                ->action('submit'),
        ];
    }
}
