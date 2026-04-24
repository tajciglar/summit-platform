<?php

namespace App\Filament\Resources\Funnels\RelationManagers;

use App\Enums\LandingPageDraftStatus;
use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LandingPageDraftsRelationManager extends RelationManager
{
    use ManagesLandingPageDrafts;

    protected static string $relationship = 'drafts';

    protected static ?string $title = 'Drafts';

    public function table(Table $table): Table
    {
        /** @var TemplateRegistry $registry */
        $registry = app(TemplateRegistry::class);

        return $table
            ->columns([
                TextColumn::make('template_key')
                    ->label('Template')
                    ->formatStateUsing(function (string $state, LandingPageDraft $record) use ($registry): string {
                        $label = $registry->exists($state) ? ($registry->get($state)['label'] ?? $state) : $state;

                        return "<div style='line-height:1.3'>
                            <div style='font-weight:600;color:#0f172a'>".e($label)."</div>
                            <div style='font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#94a3b8'>".e($state).'</div>
                        </div>';
                    })
                    ->html()
                    ->searchable(),

                TextColumn::make('version_number')
                    ->label('v')
                    ->formatStateUsing(fn (?int $state): string => $state !== null ? "v{$state}" : '—')
                    ->sortable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (LandingPageDraftStatus $state): string => $state->badgeColor())
                    ->formatStateUsing(fn (LandingPageDraftStatus $state): string => $state->label()),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options(
                        collect(LandingPageDraftStatus::cases())
                            ->mapWithKeys(fn (LandingPageDraftStatus $s): array => [$s->value => $s->label()])
                            ->all()
                    ),

                SelectFilter::make('template_key')
                    ->options(fn () => collect($registry->allKeys())
                        ->mapWithKeys(fn (string $key): array => [
                            $key => $registry->exists($key) ? ($registry->get($key)['label'] ?? $key) : $key,
                        ])
                        ->all()),
            ])
            ->headerActions([
                Action::make('generate')
                    ->label('Generate variants')
                    ->icon('heroicon-o-sparkles')
                    ->color('primary')
                    ->modalWidth('2xl')
                    ->schema([
                        Repeater::make('template_selections')
                            ->label('Templates')
                            ->helperText('Pick the templates to generate from, and how many variants each.')
                            ->minItems(1)
                            ->defaultItems(1)
                            ->addActionLabel('Add template')
                            ->schema([
                                Select::make('template_key')
                                    ->label('Template')
                                    ->options(fn () => collect($registry->allKeys())
                                        ->mapWithKeys(fn (string $key): array => [
                                            $key => $registry->exists($key) ? ($registry->get($key)['label'] ?? $key) : $key,
                                        ])
                                        ->all())
                                    ->required()
                                    ->searchable(),

                                TextInput::make('count')
                                    ->label('Variants')
                                    ->numeric()
                                    ->integer()
                                    ->minValue(1)
                                    ->maxValue(5)
                                    ->default(1)
                                    ->required(),
                            ])
                            ->columns(2),

                        TextInput::make('style_reference_url')
                            ->label('Style reference URL')
                            ->url()
                            ->helperText('Optional. AI will mirror its typography, spacing, and layout rhythm.'),
                    ])
                    ->action(function (array $data): void {
                        $countsMap = collect($data['template_selections'])
                            ->mapWithKeys(fn (array $row): array => [$row['template_key'] => (int) $row['count']])
                            ->all();

                        $batch = LandingPageBatch::create([
                            'summit_id' => $this->ownerRecord->summit_id,
                            'funnel_id' => $this->ownerRecord->id,
                            'status' => 'queued',
                            'template_pool' => array_keys($countsMap),
                            'versions_per_template' => $countsMap,
                            'version_count' => array_sum($countsMap),
                            'style_reference_url' => $data['style_reference_url'] ?? null,
                        ]);

                        GenerateLandingPageBatchJob::dispatch($batch->id);

                        Notification::make()
                            ->title('Generation started')
                            ->body('Generating '.array_sum($countsMap).' variants across '.count($countsMap).' templates.')
                            ->success()
                            ->send();
                    }),
            ])
            ->recordActions([
                Action::make('view')
                    ->label('View')
                    ->url(fn (LandingPageDraft $record): ?string => $record->preview_token
                        ? rtrim((string) config('next.url', 'http://localhost:3000'), '/')."/preview/{$record->preview_token}"
                        : null)
                    ->openUrlInNewTab()
                    ->visible(fn (LandingPageDraft $record): bool => ! empty($record->preview_token)),

                Action::make('edit')
                    ->label('Edit')
                    ->url(fn (LandingPageDraft $record): string => EditLandingPageDraftPage::getUrl([
                        'record' => $this->ownerRecord->getKey(),
                        'draft' => $record->id,
                    ])),

                Action::make('publish')
                    ->label('Publish')
                    ->color('primary')
                    ->requiresConfirmation()
                    ->modalHeading('Publish this variant as the live landing page?')
                    ->modalSubmitActionLabel('Publish')
                    ->visible(fn (LandingPageDraft $record): bool => $record->status->isPublishable())
                    ->action(function (LandingPageDraft $record): void {
                        $this->publishDraft($record->id);
                    }),

                DeleteAction::make()
                    ->label('×')
                    ->modalHeading('Delete draft?')
                    ->hidden(fn (LandingPageDraft $record): bool => ! $record->status->isDeletable())
                    ->action(function (LandingPageDraft $record): void {
                        $this->deleteDraft($record->id);
                    }),
            ])
            ->emptyStateHeading('No drafts yet')
            ->emptyStateDescription('Click Generate variants to kick off AI generation.');
    }
}
