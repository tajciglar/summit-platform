<?php

namespace App\Filament\Resources\FunnelSteps\RelationManagers;

use App\Filament\Resources\FunnelStepBumps\FunnelStepBumpResource;
use App\Models\FunnelStep;
use App\Models\FunnelStepBump;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Bumps under a checkout step. Shown only when the parent step's `step_type`
 * is `checkout` (the only step type that supports order bumps at checkout).
 * The full bump editor lives under its own resource — this manager just
 * links into it so operators can jump back and forth without leaving the
 * funnel-step context.
 */
class BumpsRelationManager extends RelationManager
{
    protected static string $relationship = 'bumps';

    protected static ?string $title = 'Order bumps';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return $ownerRecord instanceof FunnelStep
            && $ownerRecord->step_type === 'checkout';
    }

    public function form(Schema $schema): Schema
    {
        // Create / edit go through the dedicated FunnelStepBumpResource pages —
        // this relation manager never renders a modal form directly.
        return $schema->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('headline')
                    ->label('Call to action')
                    ->limit(60)
                    ->wrap(),
                TextColumn::make('product.name')
                    ->label('Product'),
                TextColumn::make('sort_order')
                    ->label('Order')
                    ->alignCenter()
                    ->sortable(),
                IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->headerActions([
                Action::make('addBump')
                    ->label('Add bump')
                    ->icon('heroicon-o-plus')
                    ->url(fn (): string => FunnelStepBumpResource::getUrl('create', [
                        'funnel_step_id' => $this->ownerRecord->id,
                    ])),
            ])
            ->recordActions([
                EditAction::make()
                    ->url(fn (FunnelStepBump $record): string => FunnelStepBumpResource::getUrl('edit', [
                        'record' => $record,
                    ])),
                DeleteAction::make(),
            ])
            ->emptyStateHeading('No order bumps yet')
            ->emptyStateDescription('Add an order bump so buyers can one-click add related offers at checkout.');
    }
}
