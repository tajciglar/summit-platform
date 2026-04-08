<?php

namespace App\Filament\Resources\FunnelSteps;

use App\Filament\Resources\FunnelSteps\Pages\CreateFunnelStep;
use App\Filament\Resources\FunnelSteps\Pages\EditFunnelStep;
use App\Filament\Resources\FunnelSteps\Pages\ListFunnelSteps;
use App\Filament\Resources\FunnelSteps\Schemas\FunnelStepForm;
use App\Filament\Resources\FunnelSteps\Tables\FunnelStepsTable;
use App\Models\FunnelStep;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FunnelStepResource extends Resource
{
    protected static ?string $model = FunnelStep::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Funnels';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Funnel Steps';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentDuplicate;

    public static function form(Schema $schema): Schema
    {
        return FunnelStepForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FunnelStepsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\BumpsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFunnelSteps::route('/'),
            'create' => CreateFunnelStep::route('/create'),
            'edit' => EditFunnelStep::route('/{record}/edit'),
        ];
    }
}
