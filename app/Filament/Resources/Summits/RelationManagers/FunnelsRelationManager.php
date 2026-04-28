<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Actions\DuplicateFunnel;
use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\Summit;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class FunnelsRelationManager extends RelationManager
{
    protected static string $relationship = 'funnels';

    protected static ?string $title = 'Funnels';

    protected static ?string $recordTitleAttribute = 'name';

    public function form(Schema $schema): Schema
    {
        // Never used — the New action below routes to the full FunnelResource create page.
        return $schema->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->groups([
                Group::make('is_active')
                    ->label('Status')
                    ->getTitleFromRecordUsing(fn (Funnel $record): string => $record->is_active ? 'Live' : 'Draft')
                    ->getKeyFromRecordUsing(fn (Funnel $record): string => $record->is_active ? '1' : '0')
                    ->orderQueryUsing(fn (Builder $query) => $query->orderByDesc('is_active')),
            ])
            ->defaultGroup('is_active')
            ->searchable(false)
            ->columns([
                IconColumn::make('is_active')
                    ->label('')
                    ->icon(fn (Funnel $record): ?string => $record->is_active ? 'heroicon-s-bolt' : null)
                    ->color('success'),
                TextColumn::make('name')
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('ac_optin_tag')
                    ->label('AC tag')
                    ->placeholder('—'),
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
                    ),
                TextColumn::make('created_at')
                    ->label('Created')
                    ->date()
                    ->sortable(),
            ])
            ->filters([])
            ->headerActions([
                Action::make('new')
                    ->label('New funnel')
                    ->icon('heroicon-o-plus')
                    ->url(fn (): string => FunnelResource::getUrl('create')),
            ])
            ->recordActions([
                Action::make('makeLive')
                    ->label('Make live')
                    ->icon('heroicon-o-bolt')
                    ->color('success')
                    ->visible(fn (Funnel $record): bool => ! $record->is_active)
                    ->requiresConfirmation()
                    ->modalHeading('Make this funnel live?')
                    ->modalDescription('Only one funnel can be live per summit. The currently live funnel will become a draft.')
                    ->modalSubmitActionLabel('Yes, make live')
                    ->action(fn (Funnel $record) => $record->update(['is_active' => true])),
                Action::make('open_live')
                    ->label('Open live')
                    ->icon('heroicon-m-arrow-top-right-on-square')
                    ->color('success')
                    ->url(fn (Funnel $record): ?string => $record->is_active && ($h = optional($record->summit?->domain)->hostname)
                        ? 'https://'.$h.'/'.$record->slug
                        : null)
                    ->openUrlInNewTab()
                    ->visible(fn (Funnel $record): bool => $record->is_active && optional($record->summit?->domain)->hostname !== null),
                ViewAction::make()
                    ->url(fn (Funnel $record): string => FunnelResource::getUrl('view', ['record' => $record])),
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
                            ->options(fn () => collect(app(TemplateRegistry::class)->allKeys())
                                ->mapWithKeys(fn (string $k) => [$k => app(TemplateRegistry::class)->get($k)['label'] ?? $k])
                                ->all())
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
                DeleteAction::make()
                    ->modalHeading('Delete funnel?')
                    ->modalDescription('This will permanently remove the funnel and its steps. This cannot be undone.'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No funnels yet')
            ->emptyStateDescription('Create a funnel to start routing visitors into this summit.')
            ->emptyStateIcon('heroicon-o-funnel');
    }
}
